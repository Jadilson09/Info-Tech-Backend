DROP TRIGGER IF EXISTS trg_validar_estoque ON produto;
DROP TRIGGER IF EXISTS trg_processar_movimentacao ON movimentacao;

DROP FUNCTION IF EXISTS validar_estoque();
DROP FUNCTION IF EXISTS processar_movimentacao();


DROP TABLE IF EXISTS movimentacao;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS categoria;

CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(80) NOT NULL,
    
    CONSTRAINT pk_categoria PRIMARY KEY (id_categoria)
);


CREATE TABLE produto (
    id_produto INTEGER GENERATED ALWAYS AS IDENTITY,
    codigo VARCHAR(50) NOT NULL,
    id_categoria INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    quantidade_estoque INTEGER NOT NULL,
    quantidade_minima INTEGER NOT NULL DEFAULT 0,
    valor_unitario NUMERIC(10, 2) NOT NULL,
    
    CONSTRAINT pk_produto PRIMARY KEY (id_produto),
    CONSTRAINT uq_produto_codigo UNIQUE (codigo),
    
    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria),

    CONSTRAINT ck_produto_preco
        CHECK (valor_unitario >= 0),

    CONSTRAINT ck_produto_quantidade
        CHECK (quantidade_estoque >= 0),

    CONSTRAINT ck_produto_quantidade_minima
        CHECK (quantidade_minima >= 0)
);


CREATE TABLE movimentacao (
    id_movimentacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produto INT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_movimentacao_produto 
        FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);


CREATE OR REPLACE FUNCTION processar_movimentacao() 
RETURNS TRIGGER AS $$
DECLARE
    v_estoque_atual INT;
BEGIN
 
    SELECT quantidade_estoque INTO v_estoque_atual 
    FROM produto WHERE id_produto = NEW.id_produto;

    IF NEW.tipo = 'SAIDA' THEN
  
        IF v_estoque_atual < NEW.quantidade THEN
            RAISE EXCEPTION 'Estoque insuficiente! Disponível: %, Solicitado: %', 
                v_estoque_atual, NEW.quantidade;
        END IF;

        UPDATE produto 
        SET quantidade_estoque = quantidade_estoque - NEW.quantidade 
        WHERE id_produto = NEW.id_produto;

    ELSIF NEW.tipo = 'ENTRADA' THEN

        UPDATE produto 
        SET quantidade_estoque = quantidade_estoque + NEW.quantidade 
        WHERE id_produto = NEW.id_produto;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_processar_movimentacao
BEFORE INSERT ON movimentacao
FOR EACH ROW
EXECUTE FUNCTION processar_movimentacao();

INSERT INTO categoria (nome) VALUES ('Periféricos'), ('Hardware');

INSERT INTO produto 
(codigo, id_categoria, nome, descricao, quantidade_estoque, quantidade_minima, valor_unitario) 
VALUES 
('PROD-01', 1, 'Mouse Gamer', 'Mouse Optico 16000 DPI', 10, 5, 150.00),
('PROD-02', 2, 'SSD 500GB', 'SSD NVMe M.2', 2, 3, 300.00); 


INSERT INTO movimentacao (id_produto, tipo, quantidade) VALUES (1, 'ENTRADA', 5);
SELECT nome, quantidade_estoque FROM produto WHERE id_produto = 1;


INSERT INTO movimentacao (id_produto, tipo, quantidade) VALUES (2, 'SAIDA', 20);

SELECT 
    p.codigo, 
    p.nome, 
    p.quantidade_estoque, 
    p.quantidade_minima,
    (p.quantidade_minima - p.quantidade_estoque) AS necessidade_reposicao
FROM produto p
WHERE p.quantidade_estoque <= p.quantidade_minima;

