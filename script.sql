-- =============================
-- INICIO/REINICIO DE ESTRUCTURA
-- =============================

DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- TABLA app_user

CREATE TABLE app_user (
	user_id			BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name		VARCHAR(100) NOT NULL,
	last_name		VARCHAR(100) NOT NULL
);

-- TABLA category

CREATE TABLE category (
	category_id		BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	description		VARCHAR(100) NOT NULL
);

-- TABLA task

CREATE TABLE task (
	task_id			BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id			BIGINT NOT NULL,
	category_id		BIGINT NOT NULL,
	title			VARCHAR(200) NOT NULL,
	description		TEXT,
	status			VARCHAR(30) DEFAULT 'Pendiente',

-- CONSTRAINTS y Referencias

CONSTRAINT fk_task_user
	FOREIGN KEY (user_id)
	REFERENCES app_user(user_id)
	ON DELETE CASCADE,

CONSTRAINT fk_task_category
	FOREIGN KEY (category_id)
	REFERENCES category(category_id)
	ON DELETE CASCADE,

CONSTRAINT chk_task_status
	CHECK (status IN ('Pendiente', 'En progreso', 'Completada'))

);

-- inserción de datos para category

INSERT INTO category (description) VALUES
	('Trabajo'),
	('Personal'),
	('Estudio'),
	('Urgente'),
	('Hogar');

-- Datos de prueba

INSERT INTO app_user (first_name, last_name) VALUES
('Patricio', 'Leiva'),
('Ana', 'González');

INSERT INTO task (user_id, title, description, status, category_id) VALUES
(1, 'Preparar prueba técnica', 'Definir estructura base del proyecto', 'Pendiente', 3),
(1, 'Configurar Docker', 'Levantar contenedores base del sistema', 'En progreso', 1),
(2, 'Comprar alimentos', 'Hacer compra semanal', 'Completada', 5);

-- ================
-- Consultas útiles
-- ================

SELECT * FROM app_user;
SELECT * FROM category;
SELECT * FROM task;

SELECT
	au.first_name || ' ' || au.last_name AS "Nombre Completo",
	t.title AS "Título",
	t.description "Descripción de tarea",
	c.description AS "Categoría"
FROM
	app_user au JOIN task t ON (au.user_id = t.user_id)
				JOIN category c ON (t.category_id = c.category_id)
;