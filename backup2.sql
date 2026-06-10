--
-- PostgreSQL database dump
--

\restrict l9ZnHzBforTQEjlgWR0mBW49GiKpUoWPZjBiyLuao2KnVdHTtfnQjoGo8ke5ThQ

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.trabajadores DROP CONSTRAINT IF EXISTS trabajadores_zona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.productos_quimicos DROP CONSTRAINT IF EXISTS productos_quimicos_zona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mantenimientos_equipos DROP CONSTRAINT IF EXISTS mantenimientos_equipos_equipo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.informes_aceptacion_maquinaria DROP CONSTRAINT IF EXISTS informes_aceptacion_maquinaria_trabajador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.informes_aceptacion_maquinaria DROP CONSTRAINT IF EXISTS informes_aceptacion_maquinaria_equipo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.equipos DROP CONSTRAINT IF EXISTS equipos_zona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.equipos_epis_obligatorios DROP CONSTRAINT IF EXISTS equipos_epis_obligatorios_equipo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.equipos_epis_obligatorios DROP CONSTRAINT IF EXISTS equipos_epis_obligatorios_epi_ficha_ev_id_fkey;
ALTER TABLE IF EXISTS ONLY public.epis DROP CONSTRAINT IF EXISTS epis_trabajador_id_trabajadores_id_fk;
ALTER TABLE IF EXISTS ONLY public.epi_documentos DROP CONSTRAINT IF EXISTS epi_documentos_epi_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documentos_expediente DROP CONSTRAINT IF EXISTS documentos_expediente_trabajador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cursos DROP CONSTRAINT IF EXISTS cursos_trabajador_id_trabajadores_id_fk;
ALTER TABLE IF EXISTS ONLY public.curso_documentos DROP CONSTRAINT IF EXISTS curso_documentos_curso_id_fkey;
ALTER TABLE IF EXISTS ONLY public.accidentes DROP CONSTRAINT IF EXISTS accidentes_trabajador_parte_id_trabajadores_id_fk;
ALTER TABLE IF EXISTS ONLY public.accidentes DROP CONSTRAINT IF EXISTS accidentes_trabajador_id_trabajadores_id_fk;
ALTER TABLE IF EXISTS ONLY public.accidente_documentos DROP CONSTRAINT IF EXISTS accidente_documentos_accidente_id_fkey;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.zonas_trabajo DROP CONSTRAINT IF EXISTS zonas_trabajo_zona_key;
ALTER TABLE IF EXISTS ONLY public.zonas_trabajo DROP CONSTRAINT IF EXISTS zonas_trabajo_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_nombre_usuario_key;
ALTER TABLE IF EXISTS ONLY public.trabajadores DROP CONSTRAINT IF EXISTS trabajadores_pkey;
ALTER TABLE IF EXISTS ONLY public.trabajadores DROP CONSTRAINT IF EXISTS trabajadores_dni_unique;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.productos_quimicos DROP CONSTRAINT IF EXISTS productos_quimicos_pkey;
ALTER TABLE IF EXISTS ONLY public.mantenimientos_equipos DROP CONSTRAINT IF EXISTS mantenimientos_equipos_pkey;
ALTER TABLE IF EXISTS ONLY public.informes_aceptacion_maquinaria DROP CONSTRAINT IF EXISTS informes_aceptacion_maquinaria_pkey;
ALTER TABLE IF EXISTS ONLY public.fichas_seguridad_productos DROP CONSTRAINT IF EXISTS fichas_seguridad_productos_pkey;
ALTER TABLE IF EXISTS ONLY public.equipos DROP CONSTRAINT IF EXISTS equipos_pkey;
ALTER TABLE IF EXISTS ONLY public.equipos_epis_obligatorios DROP CONSTRAINT IF EXISTS equipos_epis_obligatorios_pkey;
ALTER TABLE IF EXISTS ONLY public.epis DROP CONSTRAINT IF EXISTS epis_pkey;
ALTER TABLE IF EXISTS ONLY public.epis DROP CONSTRAINT IF EXISTS epis_numero_correlativo_unique;
ALTER TABLE IF EXISTS ONLY public.epis_fichas_ev DROP CONSTRAINT IF EXISTS epis_fichas_ev_pkey;
ALTER TABLE IF EXISTS ONLY public.epis_fichas_ev DROP CONSTRAINT IF EXISTS epis_fichas_ev_nombre_epi_key;
ALTER TABLE IF EXISTS ONLY public.epi_documentos DROP CONSTRAINT IF EXISTS epi_documentos_pkey;
ALTER TABLE IF EXISTS ONLY public.documentos_expediente DROP CONSTRAINT IF EXISTS documentos_expediente_pkey;
ALTER TABLE IF EXISTS ONLY public.cursos DROP CONSTRAINT IF EXISTS cursos_pkey;
ALTER TABLE IF EXISTS ONLY public.curso_documentos DROP CONSTRAINT IF EXISTS curso_documentos_pkey;
ALTER TABLE IF EXISTS ONLY public.accidentes DROP CONSTRAINT IF EXISTS accidentes_pkey;
ALTER TABLE IF EXISTS ONLY public.accidente_documentos DROP CONSTRAINT IF EXISTS accidente_documentos_pkey;
DROP TABLE IF EXISTS public.zonas_trabajo;
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.trabajadores;
DROP TABLE IF EXISTS public.session;
DROP TABLE IF EXISTS public.productos_quimicos;
DROP TABLE IF EXISTS public.mantenimientos_equipos;
DROP TABLE IF EXISTS public.informes_aceptacion_maquinaria;
DROP TABLE IF EXISTS public.fichas_seguridad_productos;
DROP TABLE IF EXISTS public.equipos_epis_obligatorios;
DROP TABLE IF EXISTS public.equipos;
DROP TABLE IF EXISTS public.epis_fichas_ev;
DROP TABLE IF EXISTS public.epis;
DROP TABLE IF EXISTS public.epi_documentos;
DROP TABLE IF EXISTS public.documentos_expediente;
DROP TABLE IF EXISTS public.cursos;
DROP TABLE IF EXISTS public.curso_documentos;
DROP TABLE IF EXISTS public.accidentes;
DROP TABLE IF EXISTS public.accidente_documentos;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accidente_documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accidente_documentos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    accidente_id character varying NOT NULL,
    nombre_archivo text NOT NULL,
    ruta_archivo text NOT NULL,
    tipo_archivo text,
    tamano_bytes integer,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: accidentes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accidentes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id character varying NOT NULL,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    gravedad text NOT NULL,
    observaciones text,
    centro_trabajo text NOT NULL,
    tipo_accidente text NOT NULL,
    lugar_accidente text NOT NULL,
    hora_accidente character varying NOT NULL,
    trabajador_parte_id character varying
);


--
-- Name: curso_documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso_documentos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    curso_id character varying NOT NULL,
    nombre_archivo text NOT NULL,
    ruta_archivo text NOT NULL,
    tipo_archivo text,
    tamano_bytes integer,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cursos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id character varying NOT NULL,
    nombre_curso text NOT NULL,
    fecha_realizacion date NOT NULL,
    duracion_horas integer NOT NULL,
    observaciones text,
    comision_servicio_url text,
    comision_servicio_firmado_url text,
    firma_url text
);


--
-- Name: documentos_expediente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos_expediente (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id character varying NOT NULL,
    nombre_documento text NOT NULL,
    archivo_url text NOT NULL,
    tipo_archivo text,
    tamano_bytes integer,
    descripcion text,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: epi_documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.epi_documentos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    epi_id character varying NOT NULL,
    nombre_archivo text NOT NULL,
    ruta_archivo text NOT NULL,
    tipo_archivo text,
    tamano_bytes integer,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: epis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.epis (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id character varying NOT NULL,
    tipo_equipo text NOT NULL,
    marca text,
    modelo text,
    fecha_entrega date NOT NULL,
    fecha_caducidad date,
    observaciones text,
    numero_correlativo character varying,
    firma_url text
);


--
-- Name: epis_fichas_ev; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.epis_fichas_ev (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    nombre_epi text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: equipos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    marca text NOT NULL,
    modelo text NOT NULL,
    fecha_adquisicion date NOT NULL,
    ficha_evaluacion_url text,
    manual_url text,
    imagen_url text,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    nombre text NOT NULL,
    numero_serie text NOT NULL,
    zona_id character varying
);


--
-- Name: equipos_epis_obligatorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipos_epis_obligatorios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    equipo_id character varying NOT NULL,
    epi_ficha_ev_id character varying NOT NULL
);


--
-- Name: fichas_seguridad_productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fichas_seguridad_productos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    marca text NOT NULL,
    modelo text NOT NULL,
    archivo_url text,
    nombre_archivo text,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: informes_aceptacion_maquinaria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.informes_aceptacion_maquinaria (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id character varying NOT NULL,
    equipo_id character varying NOT NULL,
    fecha_aceptacion date NOT NULL,
    observaciones text,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mantenimientos_equipos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mantenimientos_equipos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    equipo_id character varying NOT NULL,
    fecha date NOT NULL,
    actuacion_realizada text NOT NULL,
    persona_realiza text NOT NULL,
    observaciones text,
    firma_url text,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: productos_quimicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos_quimicos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    zona_id character varying NOT NULL,
    nombre text NOT NULL,
    ubicacion_almacen text,
    cantidad text NOT NULL,
    nombre_comercial text
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: trabajadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trabajadores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo text NOT NULL,
    categoria text NOT NULL,
    fecha_nacimiento date NOT NULL,
    dni character varying(20) NOT NULL,
    email text,
    zona_id character varying,
    ficha_evaluacion_riesgos_url text,
    fecha_incorporacion date
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    nombre_usuario text NOT NULL,
    password text NOT NULL,
    tipo_acceso text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    zonas_ids character varying[],
    email text
);


--
-- Name: zonas_trabajo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zonas_trabajo (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    zona text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: accidente_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accidente_documentos (id, accidente_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida) FROM stdin;
3dfa2903-67b7-4199-9695-0173f4288424	31a99e00-865e-412b-8d8b-98797f1db5f3	INVESTIGACION DE ACCIDENTES.pdf	/objects/uploads/3794355b-737d-4736-9bac-d02975afcb8d	application/pdf	1166538	2025-11-21 11:35:06.523506
\.


--
-- Data for Name: accidentes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accidentes (id, trabajador_id, fecha, descripcion, gravedad, observaciones, centro_trabajo, tipo_accidente, lugar_accidente, hora_accidente, trabajador_parte_id) FROM stdin;
31a99e00-865e-412b-8d8b-98797f1db5f3	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	2025-08-29	Con la puerta de una máquina pesada se pilló el índice de la mano izquierda.	LEVE	\N	PARQUE Y TALLERES ALBACETE	ACCIDENTE_SERVICIO	CM-3251 En Tiriez	09:30	12c6c37b-0137-48b0-8a38-c811a1854ed9
\.


--
-- Data for Name: curso_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.curso_documentos (id, curso_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida) FROM stdin;
b0a74644-ef44-493a-8feb-6e5719a6f2a2	34ba984e-edde-4acf-8a3e-7ffcb6120e6f	RegistroAccionFormativa_18_11_25.pdf	/objects/uploads/0636f149-0c75-440f-a85f-008830fab59b	application/pdf	1724161	2025-11-20 10:40:16.455996
\.


--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cursos (id, trabajador_id, nombre_curso, fecha_realizacion, duracion_horas, observaciones, comision_servicio_url, comision_servicio_firmado_url, firma_url) FROM stdin;
6a7e6d8d-add7-4d9f-8b02-e3a952f87e9c	12c6c37b-0137-48b0-8a38-c811a1854ed9	Prev. riesgos laborales BASICO	2025-07-14	20	AB	\N	\N	\N
4fdf6eaa-fdd1-4d1f-825f-2b45256ee64e	daefb104-7a12-41b3-af62-75c98d351579	Prevención de Riesgos Laborales Básico	2025-07-28	20	\N	\N	\N	\N
34ba984e-edde-4acf-8a3e-7ffcb6120e6f	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	CURSO SEÑALIZACION OBRAS	2025-10-21	25	TO	/objects/uploads/4a43b102-3bc1-4698-9812-47c90d26eca8	\N	\N
c9612675-1079-4a54-ab76-087251ccc55d	d1bbf4d8-916f-415e-9c24-c44c7c075264	Prevención de riesgos laborales específicos para personal COEX	2025-11-18	5	\N	\N	\N	\N
\.


--
-- Data for Name: documentos_expediente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documentos_expediente (id, trabajador_id, nombre_documento, archivo_url, tipo_archivo, tamano_bytes, descripcion, fecha_subida) FROM stdin;
\.


--
-- Data for Name: epi_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.epi_documentos (id, epi_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida) FROM stdin;
ec2c4514-f6d2-4afc-9181-78eb37eb2814	fa690562-17f9-4fa9-8f3c-37524c97c6b6	CONCEPCIÓN DIAZ VILLADA_2025_10_07_GUANTES.pdf	/objects/uploads/70502808-94b5-4f23-8dee-8a79120c0e1d	application/pdf	372531	2025-10-15 06:55:45.068816
\.


--
-- Data for Name: epis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.epis (id, trabajador_id, tipo_equipo, marca, modelo, fecha_entrega, fecha_caducidad, observaciones, numero_correlativo, firma_url) FROM stdin;
30b0be9a-05c8-432e-a927-dcbf7c66e651	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	Calzado de Seguridad con Puntera de Protección (Bota)	\N	\N	2025-10-16	\N	\N	EPI2025_005	\N
a08f3f19-6c24-44e8-a393-193f921acb2f	47c654ef-d4ef-4bda-808b-b673e3e5382f	Mascarilla	Marca	\N	2025-10-03	\N	\N	EPI2025_003	\N
8bb034b3-a4b9-4ff1-a983-b3adbe1dde77	2be981c0-d720-452c-9000-a8dcb1418cec	Chubasquero A.V.	3M	Xs	2025-10-24	\N	Talla XL	EPI2025_007	\N
365d8e72-1b64-4be5-8fc2-759ccce84f7a	6c7eb182-e76d-4b18-86ed-5ba6a5c7065a	Chubasquero A.V.	3M	Talla XL	2025-10-23	\N	\N	EPI2025_008	\N
4d1cdb3a-de0b-4055-b8b1-9b31475b0691	daefb104-7a12-41b3-af62-75c98d351579	Casco de Seguridad	R	Talla 32	2025-10-17	\N	\N	EPI2025_006	/objects/uploads/e99163a5-618d-4f6d-944e-00a9c842ef4e
fa690562-17f9-4fa9-8f3c-37524c97c6b6	4dd56b7a-0c7e-4aa7-b627-4ebf65b89d9a	Cascos de protección auditiva (EN 352-1)	Marca	\N	2020-10-07	2025-10-07	\N	EPI2025_002	\N
\.


--
-- Data for Name: epis_fichas_ev; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.epis_fichas_ev (id, nombre_epi, fecha_creacion) FROM stdin;
3a957f22-297d-4877-be03-21ea5df9612b	Guantes de protección impermeables (EN 374), de nitrilo o neopreno	2025-10-15 08:47:06.688782
c68f4393-ee00-41d7-aecd-d3012d489ec6	Gafas de seguridad y/o pantalla de protección facial (UNE-EN 166)	2025-10-15 08:47:20.932235
23dbbf92-24b6-409c-abd4-35135769f8cc	Mascarilla	2025-10-15 08:47:33.254761
b62d68dc-24ea-4742-abbb-24f6f246c533	Cascos de protección auditiva (EN 352-1)	2025-10-15 08:48:27.943606
8092ebc9-c008-4943-9173-a6a97197be47	Calzado de Seguridad con Puntera de Protección (Bota)	2025-10-15 08:49:35.946283
16ee1ad3-42d0-4920-a554-a0d4517cfde8	Casco de Seguridad	2025-10-15 08:49:50.220927
8a222edd-9aa2-4d20-9cfe-5b7c51c5a554	Guante Protección Riesgos Mecánicos	2025-10-15 08:50:05.927896
286e3d69-6d5c-4c19-b66f-406add4b41c9	Ropa de protección, calzado y guantes de protección frente a cortes y/o impactos (UNE-EN 381-5, UNE-EN 388:2004)	2025-10-15 09:45:24.792009
46a93560-4dcb-4332-baa9-5c868303feee	Chubasquero A.V.	2025-10-17 09:19:56.909549
\.


--
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipos (id, marca, modelo, fecha_adquisicion, ficha_evaluacion_url, manual_url, imagen_url, fecha_creacion, nombre, numero_serie, zona_id) FROM stdin;
0a4e1682-f149-4981-942f-ecba77dc2783	Hitachi	ZX200-6	2024-01-15	\N	\N	\N	2025-10-17 10:09:09.410261	Retroexcavadora ZX	SN-TEST-0001	\N
ad910e45-146b-4422-a6a4-ac3e31a49a58	Hitachi	ZX200-6	2024-01-15	\N	\N	\N	2025-10-17 10:12:22.582183	Retroexcavadora ZX	SN-TEST-0002	\N
173a479e-490c-4eef-9b87-a98605c97e90	SYNTESI	S-250	2025-07-14	\N	/objects/uploads/441dc4dc-b7af-4e03-9a1a-261d837cefc9	\N	2025-10-17 07:09:38.658791	HORMIGONERA GASOLINA	3209549	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6
4a0dcf57-06ed-4987-98ae-48618004169e	Hitachi	ZX200-6	2024-01-15	\N	\N	\N	2025-10-17 10:13:31.240809	Retroexcavadora ZX	SN-TEST-0003	787f4738-3267-4874-af15-1590e67a9046
d89be4fe-3b96-4722-9a94-f8bcfd5d51d9	Bosch	GSB 1800	2024-01-15	\N	\N	\N	2025-10-17 11:48:26.800115	Taladro Industrial	TEST-001	787f4738-3267-4874-af15-1590e67a9046
cc719b08-19c2-4196-a1ee-9991302c2c37	STHIL	HT 131	2014-01-01	/objects/uploads/ad32786a-0c14-4a7d-9354-cd6c30043b4c	/objects/uploads/bad85cb1-7cd5-4c54-a26c-3209df7cf739	/objects/uploads/6bc016af-e2ce-4e87-8dea-77b0a3ee700b	2025-10-15 09:44:48.247856	PODADORA DE ALTURA	298488697	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6
05d369ec-f6fc-435e-85ba-bc4a2a2fd228	STHIL	HT 131	2017-11-01	/objects/uploads/2807d995-818a-4dec-928b-ae31a456f350	/objects/uploads/00bc44ae-01ff-4aef-9fb6-f52896d29c73	/objects/uploads/c1a56879-ab20-4291-9a5f-a119c49a7f5c	2025-10-15 15:55:16.221626	PODADORA DE ALTURA	12223133	41631e0c-6f75-41a3-92f2-916a35efa1c1
\.


--
-- Data for Name: equipos_epis_obligatorios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipos_epis_obligatorios (id, equipo_id, epi_ficha_ev_id) FROM stdin;
a06f9976-d599-4581-a4b0-dc6f8f448bfd	cc719b08-19c2-4196-a1ee-9991302c2c37	b62d68dc-24ea-4742-abbb-24f6f246c533
d9da73fe-2083-4711-b1f0-dd16c3d3a534	05d369ec-f6fc-435e-85ba-bc4a2a2fd228	b62d68dc-24ea-4742-abbb-24f6f246c533
20d50c45-99dd-4fb7-9c18-b81b93a2ebf1	05d369ec-f6fc-435e-85ba-bc4a2a2fd228	c68f4393-ee00-41d7-aecd-d3012d489ec6
a2d23e9d-8605-4aaa-9f8e-4c939a1d6596	173a479e-490c-4eef-9b87-a98605c97e90	8092ebc9-c008-4943-9173-a6a97197be47
e533a155-9070-4532-87d6-6c0d99e9a3a5	173a479e-490c-4eef-9b87-a98605c97e90	8a222edd-9aa2-4d20-9cfe-5b7c51c5a554
81c03b5a-2083-429b-8bce-b260fb4819fa	173a479e-490c-4eef-9b87-a98605c97e90	c68f4393-ee00-41d7-aecd-d3012d489ec6
bfe7eb39-ef0c-4e3b-ba55-1b9a8ba66486	4a0dcf57-06ed-4987-98ae-48618004169e	c68f4393-ee00-41d7-aecd-d3012d489ec6
29a604b6-b338-4948-8187-2030927c6dff	4a0dcf57-06ed-4987-98ae-48618004169e	8a222edd-9aa2-4d20-9cfe-5b7c51c5a554
d17ec68e-4da9-4a29-a662-8485735374e1	d89be4fe-3b96-4722-9a94-f8bcfd5d51d9	3a957f22-297d-4877-be03-21ea5df9612b
7af292c0-f913-4d4f-87bf-ccd6a76ca363	d89be4fe-3b96-4722-9a94-f8bcfd5d51d9	c68f4393-ee00-41d7-aecd-d3012d489ec6
\.


--
-- Data for Name: fichas_seguridad_productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fichas_seguridad_productos (id, nombre, marca, modelo, archivo_url, nombre_archivo, fecha_creacion) FROM stdin;
3908fba1-0775-4ca4-8841-bd960b293072	Jabón de manos	Kiriko	Frutos rojos 500 ml	/objects/uploads/8e3c6163-7def-485c-a65f-b817654b7c00	\N	2025-10-17 06:40:20.613875
ecbeb597-d15a-4e51-a11c-9e1fb5164808	Aglomerado asfáltico en frio	2R	Fraguado en frío	/objects/uploads/fc96578c-89e9-41d7-a1a2-2fecc7fc26d0	\N	2025-10-17 06:54:02.726035
\.


--
-- Data for Name: informes_aceptacion_maquinaria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.informes_aceptacion_maquinaria (id, trabajador_id, equipo_id, fecha_aceptacion, observaciones, fecha_creacion) FROM stdin;
79a1cfec-2e5d-4d14-b005-242d0b9f330c	47c654ef-d4ef-4bda-808b-b673e3e5382f	cc719b08-19c2-4196-a1ee-9991302c2c37	2025-10-17	\N	2025-10-17 10:06:34.314397
65afabfe-f340-4003-9eb8-db9099f98d94	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	cc719b08-19c2-4196-a1ee-9991302c2c37	2025-10-17	\N	2025-10-17 10:07:42.112116
c887aaa9-640e-4c8e-a3ae-9fb9a83c91ac	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	cc719b08-19c2-4196-a1ee-9991302c2c37	2025-10-17	\N	2025-10-17 10:08:39.218615
33385c45-ffb1-45d7-aa02-f1366b69581a	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:14:15.40021
84cf9f83-d429-4ad3-ab1a-20af672bc182	212c4f2d-97e8-4252-8448-ee2ee5b7ab7a	4a0dcf57-06ed-4987-98ae-48618004169e	2024-10-17	Equipo autorizado tras formación específica en seguridad	2025-10-17 10:15:11.986564
8f8fd46d-0cc3-4d08-8a42-823a341e394f	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:16:24.971146
281aed7a-91be-4be1-a9bc-d8fddcaf3c11	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:20:13.634675
75495b58-931f-4a80-8e7e-1edafa19e659	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:22:18.794573
c1277d88-a38c-4fce-9c44-32e33ffe20f5	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:23:31.764384
327a6a74-9935-48d7-ab1b-5e6e14c85224	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:31:34.612114
14e1ed07-ee2d-4121-b3f7-39428ac4873e	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:34:02.972004
eb5f2f1c-de8c-4b7a-8dc7-7e5f72cb9ad3	212c4f2d-97e8-4252-8448-ee2ee5b7ab7a	4a0dcf57-06ed-4987-98ae-48618004169e	2024-10-17	\N	2025-10-17 10:36:08.0689
49aba0e1-c58c-4cf9-b7a6-36ffad8d6996	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:39:18.835089
cdbe134a-b6a1-4c68-9fc4-f95b50220b0b	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:43:35.757584
2dcfefeb-1269-423e-af86-f02ae3c9ebb9	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:53:13.568267
251411a0-24b1-4465-9456-fbb2f04b91fd	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:56:11.815288
f3d885b7-d598-403a-a732-84df7517707a	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 10:59:58.672326
2e61c57f-96ca-4402-bd30-6c53aab89e8b	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:05:15.580059
3c104da2-9478-47d5-867e-d3e3de9f966f	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:06:53.266605
1ec310c1-e9a3-4762-9aed-d885f2f05318	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:09:41.42116
4429ded0-acc4-47f1-94a9-3ec9c528df8f	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:12:58.531201
cbf7e842-0b5e-42de-96a7-a9bd20d19ed7	fa050abd-e5d9-4ee2-9e01-4d2045c46df3	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:15:18.229913
9735e75c-f205-4237-9763-6f87c2ab375f	47c654ef-d4ef-4bda-808b-b673e3e5382f	173a479e-490c-4eef-9b87-a98605c97e90	2025-10-17	\N	2025-10-17 11:16:27.851188
\.


--
-- Data for Name: mantenimientos_equipos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mantenimientos_equipos (id, equipo_id, fecha, actuacion_realizada, persona_realiza, observaciones, firma_url, fecha_creacion) FROM stdin;
a8d51928-fa1f-4ec9-8eed-baebeb040cad	d89be4fe-3b96-4722-9a94-f8bcfd5d51d9	2025-10-23	Revisión trimestral completa del equipo	Juan Pérez	Todo en orden, sin incidencias	https://storage.googleapis.com/replit-objstore-3e903fb9-6351-4cb2-9dd8-9252bf6cc77d/.private/uploads/d1e0cb8f-3e31-422a-b5bc-75a9b95831a2?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251023%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251023T082039Z&X-Goog-Expires=899&X-Goog-Signature=95ac0f46eade1860a3dc2db1f40b9a55b1c7ac6290ba21068324461acd6c5b097ee1c23056434934056de135d5e15b332ef8ba770a61b1aa15c27a75fc1519630628030ae1745b8176f3241b949fc087a2f33f56338239058054f4878ff3273d9337cd8613123e73347dc1d221061c50eadb5fb7a13f2f0556b5d0e152530a4ed708af41dfaabcea0ad0c96598a4e2b0a652914678addb803cc81493e0f136a5aa768d6bc78867c5078e0876c36563b1ebf9952b7f1a7de79d7706d923fecd634a794c278964734d4ef1b436e3ea8b12130ab188c925cbf62dca5e0bf41eef162b41648d16f12790454a8409c3b356b33b8fbbf54cb638a75046f54307608c22&X-Goog-SignedHeaders=host	2025-10-23 08:20:42.297728
6b305331-9c62-4b93-ad14-49b196158f6e	05d369ec-f6fc-435e-85ba-bc4a2a2fd228	2025-10-23	Cambiar espadín por sufrir desgaste prolongado.	Nestor García	Se compra uno nuevo	/objects/uploads/14e87810-d21a-4166-b433-f6eb5fa6dff0	2025-10-23 08:35:30.863308
70849b8a-b3e1-4ccf-93b6-081dd1797768	05d369ec-f6fc-435e-85ba-bc4a2a2fd228	2025-10-06	Cambio de filtros	Juan Carlos Sarriaá	Se cambian todos los filtros	/objects/uploads/9b0b5a85-4f6e-49b1-b7b5-aa1dab03aa5c	2025-10-23 08:36:36.611405
129fc798-693c-4018-9d7d-2e04e724a2a7	173a479e-490c-4eef-9b87-a98605c97e90	2025-11-10	Cambio de polea	Cesar García Uceda	Polea original	/objects/uploads/f9dba083-d27d-4775-9376-2d72e24d0620	2025-11-10 13:04:06.440725
\.


--
-- Data for Name: productos_quimicos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos_quimicos (id, zona_id, nombre, ubicacion_almacen, cantidad, nombre_comercial) FROM stdin;
fb63fc2d-31f8-4636-9cd3-8ed41b20eae1	787f4738-3267-4874-af15-1590e67a9046	Producto-yEUHevAN	Almacén A-3	10	Test Product Commercial
7f99507c-005e-4b2e-9f71-0fdbc5150ee0	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	Aceite engrase cadena	Cochera	20 L.	SilverOil
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
j0bsSLh6ruGh2SOW2X8eEeYNZCMUkyr0	{"cookie":{"originalMaxAge":604799999,"expires":"2025-12-03T10:59:10.416Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"d225d75a-d25f-4004-9a4d-687c63c1944f","nombreUsuario":"ahurtado@jccm.es","tipoAcceso":"Usuario","zonasIds":["787f4738-3267-4874-af15-1590e67a9046"],"trabajadorId":"daefb104-7a12-41b3-af62-75c98d351579"}	2025-12-03 11:00:43
62e2iPpfAkpFqcjSIWCiWhPArl8ZSbxL	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-27T10:50:46.677Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"d225d75a-d25f-4004-9a4d-687c63c1944f","nombreUsuario":"ahurtado@jccm.es","tipoAcceso":"Usuario","zonasIds":["787f4738-3267-4874-af15-1590e67a9046"],"trabajadorId":"daefb104-7a12-41b3-af62-75c98d351579"}	2025-11-27 10:55:33
2ygd3bTuwdrqAdGIBudHE4u113uIYll7	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-27T10:44:40.694Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"d225d75a-d25f-4004-9a4d-687c63c1944f","nombreUsuario":"ahurtado@jccm.es","tipoAcceso":"Usuario","zonasIds":["787f4738-3267-4874-af15-1590e67a9046"],"trabajadorId":"daefb104-7a12-41b3-af62-75c98d351579"}	2025-11-27 10:45:01
444o7v-BXCdA79Usu1n7WMomUBvAGAUL	{"cookie":{"originalMaxAge":604800000,"expires":"2025-12-03T11:03:50.038Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"d225d75a-d25f-4004-9a4d-687c63c1944f","nombreUsuario":"ahurtado@jccm.es","tipoAcceso":"Usuario","zonasIds":["787f4738-3267-4874-af15-1590e67a9046"],"trabajadorId":"daefb104-7a12-41b3-af62-75c98d351579"}	2025-12-03 11:03:52
hGD5ISKRHF8BEh5Z_WbP5omkN_btAu35	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-27T10:36:54.969Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"d225d75a-d25f-4004-9a4d-687c63c1944f","nombreUsuario":"ahurtado@jccm.es","tipoAcceso":"Usuario","zonasIds":["787f4738-3267-4874-af15-1590e67a9046"],"trabajadorId":"daefb104-7a12-41b3-af62-75c98d351579"}	2025-11-27 10:37:20
\.


--
-- Data for Name: trabajadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trabajadores (id, nombre_completo, categoria, fecha_nacimiento, dni, email, zona_id, ficha_evaluacion_riesgos_url, fecha_incorporacion) FROM stdin;
47c654ef-d4ef-4bda-808b-b673e3e5382f	Juan Carlos Martínez Sarria	PEON ESP.	1965-01-01	5.200.682-Z	jcarlosms@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	\N
212c4f2d-97e8-4252-8448-ee2ee5b7ab7a	Cesareo Valcarcel Cabezuelo	ENC. GRAL. O.P.	1970-01-01	8877665544	cesareov@jccm.es	787f4738-3267-4874-af15-1590e67a9046	\N	\N
12c6c37b-0137-48b0-8a38-c811a1854ed9	Francisco Zornoza Albiar	ENCARGADO	1960-01-01	4.548.254-D	fzornoza@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	/objects/uploads/d0c11018-9dfb-413c-82ee-8163bcff0bea	\N
4dd56b7a-0c7e-4aa7-b627-4ebf65b89d9a	Concepción Diaz Villada	PEON ESP.	1972-01-01	7.545.225-Y	cdiazv@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	/objects/uploads/3e613f55-3db2-4279-8da5-dbde40e465c2	\N
e56b5294-ce99-43c5-adfb-139489593dbb	Nestor Tercero Pastor	CONDUCTOR	1984-10-20	47.080.970-Q	ntercero@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	\N
2be981c0-d720-452c-9000-a8dcb1418cec	Jose Luis García García	OPERADOR M.P.	1974-07-03	52.758.594-K	jgarciag@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	\N
6c7eb182-e76d-4b18-86ed-5ba6a5c7065a	Carmelo Moreno Diaz	PEON ESP.	1969-12-04	7.558.657-Y	cmorenod@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	\N
d1bbf4d8-916f-415e-9c24-c44c7c075264	David Jiménez Minaya	ENC. GRAL. O.P.	1979-12-10	47.062.993-W	djimenez@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	\N
4fa6aede-b328-4ced-a370-3fd67e68f5d5	Usuario de Prueba	Técnico	1990-01-01	12345678X	test_usuario	787f4738-3267-4874-af15-1590e67a9046	\N	\N
fa050abd-e5d9-4ee2-9e01-4d2045c46df3	Cesar García Uceda	PEON ESP.	1990-05-15	47.055.859-R	cguceda@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	/objects/uploads/323db156-23aa-47f5-8b68-1a6ab86cdacd	\N
daefb104-7a12-41b3-af62-75c98d351579	Ana R. García Hurtado	ENCARGADO	1980-12-29	52.389.417-V	ahurtado@jccm.es	787f4738-3267-4874-af15-1590e67a9046	/objects/uploads/1865f952-b104-414c-8c9f-bb0b1786c42e	2020-01-15
52fcfe07-7516-40e1-9de4-c949e29b8b47	Eusebio Salvador García	CONDUCTOR	1972-01-29	74.507.857-R	esalvador@jccm.es	aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	\N	2019-06-27
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre_usuario, password, tipo_acceso, fecha_creacion, zonas_ids, email) FROM stdin;
00a616ca-96d5-4044-a8e3-2d7b21ebd0e5	cesareov@jccm.es	$2b$10$AYGO1z3vMOXUIgQSHJB2OO75Lly.bmMqamCzsPKz44tiY3MimRK6y	Administrador	2025-10-16 08:10:06.825918	{787f4738-3267-4874-af15-1590e67a9046,41631e0c-6f75-41a3-92f2-916a35efa1c1}	cesareov@jccm.es
90db08d4-3a70-4619-b111-306aba9c17d0	djimenezad@jccm.es	$2b$10$.zQP18zXK8mpHoEknwygY.XHcUMM0zPdt5z/J6.4ZXa5w7lT4Ibia	AdminGral	2025-10-15 15:17:54.390431	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	djimenezad@jccm.es
23ba4e60-a6cc-47da-b7e4-86eda53aaf5c	test_admin	$2b$10$8s8uh23RsKRSbNl2v.0kR.QQ2jqh2W0YC3vJCKAA.uXPphJsvTYQK	Administrador	2025-10-17 10:00:34.057171	{787f4738-3267-4874-af15-1590e67a9046}	test@admin.com
c1726308-7e0c-403c-a991-2c39967e8121	test_usuario	$2b$10$8s8uh23RsKRSbNl2v.0kR.QQ2jqh2W0YC3vJCKAA.uXPphJsvTYQK	Usuario	2025-10-17 11:38:34.628862	\N	test_usuario@test.com
e2e-test-admin-001	e2e_admin	$2b$10$lmy9CUDIGj3Xn.gYLNh2qONOQHNQaYZfH96nJDAFawikiNhkjkW62	AdminGral	2025-10-17 12:19:09.01067	{}	e2e@test.com
74a31fb8-4863-402b-a0da-0a545ff1e658	test_auto	$2b$10$dpvDPLB8N9nDjgAZ9hR2yuxzsbGWmLUBb0mziJBrUlqoYWh.zzLVu	Administrador	2025-10-21 10:37:37.325926	{787f4738-3267-4874-af15-1590e67a9046}	\N
36fd01d5-56ff-4a91-88b2-9bd6d06d8122	usuario_test	$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdTL9EJUK	Usuario	2025-10-23 09:00:08.86456	\N	usuario_test@test.com
eaa3f98b-3a3a-4caa-87e9-7c3d4db03dfa	admin_test	$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdTL9EJUK	Administrador	2025-10-23 09:00:08.86456	\N	admin_test@test.com
8adfdc47-b1a2-457f-bf35-7757cacf49f5	cguceda@jccm.es	$2b$10$q9yLFuMbPqAirVlki97z2evacka0cvAD./SVdYuXX/Cqoen66wuFS	Usuario	2025-11-04 12:07:12.89769	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	\N
d225d75a-d25f-4004-9a4d-687c63c1944f	ahurtado@jccm.es	$2b$10$AQgtZ.36CoWig/JbHX4tlei6cxVWCAFBmVSd.sYUHOwHH.GL.x3xG	Usuario	2025-10-16 10:20:33.197017	{787f4738-3267-4874-af15-1590e67a9046}	ahurtado@jccm.es
1ef9eecc-8e3b-4dea-99ac-5f44f8ab2f35	AdminGral	$2b$10$4mhj.sNIxUJE74DFDEgNq.YnY/g0v4Gq8h2BgdmCV6xOoAODA4BmW	AdminGral	2025-10-17 06:24:21.097379	\N	fuerzayhonor2002@gmail.com
4f130eb7-d503-4c10-8003-0156096ef310	cdiazv@jccm.es	$2b$10$aMqba987rorFyPTpB6wKJuMuL/mSeER8QsgtUX9gvT3WteMegv0hq	Usuario	2025-10-15 15:19:09.173608	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	cdiazv@jccm.es
ae187ae4-2324-45ad-9436-3a519817c219	esalvador@jccm.es	$2b$10$cEXU5Fg/0Fwz9aRbbXaa1eJ4CCLkRS5KNPSc3GX0YcinBxTgw/IA2	Usuario	2025-11-26 11:06:08.563103	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	\N
3132c87e-8739-4e39-b4a8-e71616b0bb8d	djimenez@jccm.es	$2b$10$cjbE0lMnlnNY5t1mpq4X4eTV/gTl45RrPGH69qUqiWaz1VwFlkRGG	Administrador	2025-10-16 09:13:03.050369	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	djimenez@jccm.es
1356ad7d-aaf9-4d85-9b0b-d6d8141a8fe4	cmorenod@jccm.es	$2b$10$e3HjZiPXqOhMaIA/.suzFuR2YWDf7Tk8NWB5GJbzvjxU.xqao8ySK	Usuario	2025-10-17 07:12:22.425111	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	cmorenod@jccm.es
276cd599-e474-436b-88fe-5865414de8d3	UsuarioPrueba	$2b$10$K7K3fZ3YjX7X2Z5Z5Z5Z5ePXZxvZxVzVzVzVzVzVzVzVzVzVzVzV.	Usuario	2025-10-17 08:32:55.605038	{}	UsuarioPrueba
0fc16018-4d38-4f4b-a99b-282de1974fbf	fzornoza@jccm.es	$2b$10$U3PEB2zqXhocKUIR6HY3LuJFdFMFshg6LjWyETcMdQegs.mf8.q.a	Administrador	2025-10-15 15:18:25.718802	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	fzornoza@jccm.es
\.


--
-- Data for Name: zonas_trabajo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zonas_trabajo (id, zona, fecha_creacion) FROM stdin;
787f4738-3267-4874-af15-1590e67a9046	Zona 1.1 Alcaraz	2025-10-15 11:45:31.604363
41631e0c-6f75-41a3-92f2-916a35efa1c1	Zona 1.2 Munera	2025-10-15 11:45:43.399191
aa09dcc4-e9d2-4c41-b007-b938d35eb6d6	Zona 2.2 Almansa	2025-10-15 11:46:05.734735
65da0e33-4dc7-4c4a-8713-25c30faa3d98	Zona 3.1 Albacete	2025-10-15 11:46:20.24844
dd9a3c2e-cc26-41db-86d4-5ef093b594f6	Zona 3.2 Elche	2025-10-15 11:46:32.9856
\.


--
-- Name: accidente_documentos accidente_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidente_documentos
    ADD CONSTRAINT accidente_documentos_pkey PRIMARY KEY (id);


--
-- Name: accidentes accidentes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidentes
    ADD CONSTRAINT accidentes_pkey PRIMARY KEY (id);


--
-- Name: curso_documentos curso_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_documentos
    ADD CONSTRAINT curso_documentos_pkey PRIMARY KEY (id);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: documentos_expediente documentos_expediente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_expediente
    ADD CONSTRAINT documentos_expediente_pkey PRIMARY KEY (id);


--
-- Name: epi_documentos epi_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epi_documentos
    ADD CONSTRAINT epi_documentos_pkey PRIMARY KEY (id);


--
-- Name: epis_fichas_ev epis_fichas_ev_nombre_epi_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epis_fichas_ev
    ADD CONSTRAINT epis_fichas_ev_nombre_epi_key UNIQUE (nombre_epi);


--
-- Name: epis_fichas_ev epis_fichas_ev_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epis_fichas_ev
    ADD CONSTRAINT epis_fichas_ev_pkey PRIMARY KEY (id);


--
-- Name: epis epis_numero_correlativo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epis
    ADD CONSTRAINT epis_numero_correlativo_unique UNIQUE (numero_correlativo);


--
-- Name: epis epis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epis
    ADD CONSTRAINT epis_pkey PRIMARY KEY (id);


--
-- Name: equipos_epis_obligatorios equipos_epis_obligatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipos_epis_obligatorios
    ADD CONSTRAINT equipos_epis_obligatorios_pkey PRIMARY KEY (id);


--
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);


--
-- Name: fichas_seguridad_productos fichas_seguridad_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fichas_seguridad_productos
    ADD CONSTRAINT fichas_seguridad_productos_pkey PRIMARY KEY (id);


--
-- Name: informes_aceptacion_maquinaria informes_aceptacion_maquinaria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informes_aceptacion_maquinaria
    ADD CONSTRAINT informes_aceptacion_maquinaria_pkey PRIMARY KEY (id);


--
-- Name: mantenimientos_equipos mantenimientos_equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimientos_equipos
    ADD CONSTRAINT mantenimientos_equipos_pkey PRIMARY KEY (id);


--
-- Name: productos_quimicos productos_quimicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_quimicos
    ADD CONSTRAINT productos_quimicos_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: trabajadores trabajadores_dni_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_dni_unique UNIQUE (dni);


--
-- Name: trabajadores trabajadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: zonas_trabajo zonas_trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_trabajo
    ADD CONSTRAINT zonas_trabajo_pkey PRIMARY KEY (id);


--
-- Name: zonas_trabajo zonas_trabajo_zona_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_trabajo
    ADD CONSTRAINT zonas_trabajo_zona_key UNIQUE (zona);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: accidente_documentos accidente_documentos_accidente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidente_documentos
    ADD CONSTRAINT accidente_documentos_accidente_id_fkey FOREIGN KEY (accidente_id) REFERENCES public.accidentes(id) ON DELETE CASCADE;


--
-- Name: accidentes accidentes_trabajador_id_trabajadores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidentes
    ADD CONSTRAINT accidentes_trabajador_id_trabajadores_id_fk FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id) ON DELETE CASCADE;


--
-- Name: accidentes accidentes_trabajador_parte_id_trabajadores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidentes
    ADD CONSTRAINT accidentes_trabajador_parte_id_trabajadores_id_fk FOREIGN KEY (trabajador_parte_id) REFERENCES public.trabajadores(id);


--
-- Name: curso_documentos curso_documentos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_documentos
    ADD CONSTRAINT curso_documentos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: cursos cursos_trabajador_id_trabajadores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_trabajador_id_trabajadores_id_fk FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id) ON DELETE CASCADE;


--
-- Name: documentos_expediente documentos_expediente_trabajador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_expediente
    ADD CONSTRAINT documentos_expediente_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id) ON DELETE CASCADE;


--
-- Name: epi_documentos epi_documentos_epi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epi_documentos
    ADD CONSTRAINT epi_documentos_epi_id_fkey FOREIGN KEY (epi_id) REFERENCES public.epis(id) ON DELETE CASCADE;


--
-- Name: epis epis_trabajador_id_trabajadores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epis
    ADD CONSTRAINT epis_trabajador_id_trabajadores_id_fk FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id) ON DELETE CASCADE;


--
-- Name: equipos_epis_obligatorios equipos_epis_obligatorios_epi_ficha_ev_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipos_epis_obligatorios
    ADD CONSTRAINT equipos_epis_obligatorios_epi_ficha_ev_id_fkey FOREIGN KEY (epi_ficha_ev_id) REFERENCES public.epis_fichas_ev(id) ON DELETE CASCADE;


--
-- Name: equipos_epis_obligatorios equipos_epis_obligatorios_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipos_epis_obligatorios
    ADD CONSTRAINT equipos_epis_obligatorios_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE;


--
-- Name: equipos equipos_zona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_zona_id_fkey FOREIGN KEY (zona_id) REFERENCES public.zonas_trabajo(id);


--
-- Name: informes_aceptacion_maquinaria informes_aceptacion_maquinaria_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informes_aceptacion_maquinaria
    ADD CONSTRAINT informes_aceptacion_maquinaria_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE;


--
-- Name: informes_aceptacion_maquinaria informes_aceptacion_maquinaria_trabajador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informes_aceptacion_maquinaria
    ADD CONSTRAINT informes_aceptacion_maquinaria_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id) ON DELETE CASCADE;


--
-- Name: mantenimientos_equipos mantenimientos_equipos_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimientos_equipos
    ADD CONSTRAINT mantenimientos_equipos_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE;


--
-- Name: productos_quimicos productos_quimicos_zona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_quimicos
    ADD CONSTRAINT productos_quimicos_zona_id_fkey FOREIGN KEY (zona_id) REFERENCES public.zonas_trabajo(id);


--
-- Name: trabajadores trabajadores_zona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_zona_id_fkey FOREIGN KEY (zona_id) REFERENCES public.zonas_trabajo(id);


--
-- PostgreSQL database dump complete
--

\unrestrict l9ZnHzBforTQEjlgWR0mBW49GiKpUoWPZjBiyLuao2KnVdHTtfnQjoGo8ke5ThQ

