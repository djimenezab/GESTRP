--
-- PostgreSQL database dump
--

\restrict 9Q3qyQafhZi0LUftc2f4VFiCx7dZdhgp0OGhpzRsg6NP0y5IpJHN0X2l7amhzTi

-- Dumped from database version 16.14 (146758d)
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
DROP INDEX IF EXISTS _system.idx_replit_database_migrations_v1_build_id;
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
ALTER TABLE IF EXISTS ONLY _system.replit_database_migrations_v1 DROP CONSTRAINT IF EXISTS replit_database_migrations_v1_pkey;
ALTER TABLE IF EXISTS _system.replit_database_migrations_v1 ALTER COLUMN id DROP DEFAULT;
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
DROP SEQUENCE IF EXISTS _system.replit_database_migrations_v1_id_seq;
DROP TABLE IF EXISTS _system.replit_database_migrations_v1;
DROP SCHEMA IF EXISTS _system;
--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _system;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: -
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: -
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: -
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


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
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: -
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	a0bf076d-20fe-4bdb-9739-2b8569c3f991	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	1	2025-10-18 06:37:43.851743+00
2	bd22534e-80d8-48a0-ae25-ee73543e1588	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	1	2025-10-18 06:44:04.886016+00
3	8a9cebc0-ee81-4d87-9c5d-4fcd7eab59df	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	2	2025-10-21 10:44:53.488028+00
4	11c14664-414f-450a-a39a-d9fed751877f	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	2	2025-10-23 08:39:08.171584+00
5	12f926df-396e-431c-9ef4-e87d0dcc986b	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	1	2025-10-23 10:36:06.490943+00
6	e5acda9d-a979-467c-8ca9-d2941b81bc11	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	3	2025-11-04 13:38:16.247692+00
7	d2522ba2-5f66-4545-b7fd-1ba7383b2f35	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	2	2025-11-20 11:11:15.961249+00
8	cfaf729a-ebdd-4a75-acb5-1a67b0826f62	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	2	2025-11-21 12:24:32.769428+00
9	116d7dc7-f9ab-4f92-9d65-7c150533eaf8	1d5ed8f7-22c7-4534-adf8-f7c995015fa9	1	2025-11-26 11:08:08.055341+00
\.


--
-- Data for Name: accidente_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accidente_documentos (id, accidente_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida) FROM stdin;
7feb1c8e-335d-4fb1-b082-af46acf5302d	4762ad90-8a1c-48f4-84bc-3d6d97bb8efb	2025_09_02. Accidente de trabajo de César García Uceda.pdf	/objects/uploads/4443b2d4-90a6-4459-83e6-1e72e499936a	application/pdf	136419	2025-11-26 10:40:38.177306
c5e965c6-831f-4da4-9d59-99f31d15eeeb	4762ad90-8a1c-48f4-84bc-3d6d97bb8efb	INVESTIGACION DE ACCIDENTE_CesarGU.pdf	/objects/uploads/74f04e68-80ca-448f-a627-af940b90b0f1	application/pdf	1166538	2025-11-26 10:42:08.37469
\.


--
-- Data for Name: accidentes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accidentes (id, trabajador_id, fecha, descripcion, gravedad, observaciones, centro_trabajo, tipo_accidente, lugar_accidente, hora_accidente, trabajador_parte_id) FROM stdin;
4762ad90-8a1c-48f4-84bc-3d6d97bb8efb	37d81fcb-baea-4f86-bfa1-49e547279e8d	2025-09-02	Preparando la motosierra para podar, se hace un corte en la rodilla.	LEVE	Hace el parte de accidente Cesaro Valcarcel Cabezuelo al no estar los encargados de Zona 2.2	Destacamento de Almansa	ACCIDENTE_SERVICIO	CM-3201	12:15	\N
\.


--
-- Data for Name: curso_documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.curso_documentos (id, curso_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida) FROM stdin;
99226b58-8c63-4f4c-a8da-5aca287ed94c	ea1598f3-ed7e-479a-87aa-08a94551c53c	RegistroAccionFormativa_18_11_25.pdf	/objects/uploads/6e0014ea-813e-4a29-b8eb-341800ac088c	application/pdf	1724161	2025-11-20 11:12:37.781165
\.


--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cursos (id, trabajador_id, nombre_curso, fecha_realizacion, duracion_horas, observaciones, comision_servicio_url, comision_servicio_firmado_url, firma_url) FROM stdin;
3df5dc7d-f03c-43d8-9624-0ebafdb30d43	37d81fcb-baea-4f86-bfa1-49e547279e8d	Manejo Mant. Pequeña Maquinaria, Herramientas y elementos auxiliares	2025-10-06	25	Ciudad Real	/objects/uploads/0a72bdb7-22bf-4f53-a6be-c570f360b126	/objects/uploads/a9a6de35-a3ce-43d4-ae0b-5a384f8ad4be	/objects/uploads/4f29e15e-4a5e-4201-a355-3da5957a5e6b
ea1598f3-ed7e-479a-87aa-08a94551c53c	abeb26b0-9077-475c-b010-43bc4dd831aa	Prevención de riesgos laborales específicos para personal COEX	2025-11-18	5	ALBACETE - Casa Perona PRL Mandos intermedios	\N	\N	\N
f561fff4-353b-4e6e-961e-eaa404cd7fd6	d13a02f2-25aa-4be5-8f9d-57ba74a8cd85	Prevención de riesgos laborales específicos para personal COEX	2025-11-18	5	ALBACETE - Casa Perona PRL Mandos intermedios	\N	\N	\N
3d820ac0-411b-440e-a9d5-b5621d4d00c4	8d86c9ae-e4ab-460b-81a1-f2ae1b4421cb	Formación Específica de PRL para personal COEX	2025-11-19	5	ALBACETE - Deleg. Sanidad	\N	\N	\N
c2d8672b-6986-43ef-bb60-4173b4f65b6a	7d5041af-0126-48b4-8a5a-fea24ac06fb0	Formación Específica de PRL para personal COEX	2025-11-19	5	ALBACETE - Deleg. Sanidad	\N	\N	\N
97884cbe-9b7c-43b9-b85c-52d06209ac25	b105ccce-bf46-491d-b580-a03114439ff3	Formación Específica de PRL para personal COEX	2025-11-19	5	ALBACETE - Deleg. Sanidad	\N	\N	\N
1e7f7e4b-dc9f-4ee2-9e93-e702cdc11cae	37d81fcb-baea-4f86-bfa1-49e547279e8d	Señalización y Balizamiento de obras en carreteras	2025-10-21	20	Toledo	/objects/uploads/3f1eb2a0-7012-47a1-a964-6207388ddea1	/objects/uploads/c5cbb44b-e04f-43d7-82b9-5f3fa88eb7a4	/objects/uploads/6d52e430-154e-424f-90da-19cf57fd4f69
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
\.


--
-- Data for Name: epis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.epis (id, trabajador_id, tipo_equipo, marca, modelo, fecha_entrega, fecha_caducidad, observaciones, numero_correlativo, firma_url) FROM stdin;
72b53ea8-97d8-439f-89d0-5573a0bc053c	78b07ef7-4245-4de2-9103-c20475247481	 Guantes de protección anticortes	Oleomac	Talla X	2025-10-23	\N	\N	EPI2025_001	\N
4e0d114d-f4fa-4868-8258-72b2028aa2da	05c8869b-6418-4a71-8da7-51583df6c2f5	Cascos de protección auditiva	3M	PELTOR X5A	2025-10-29	\N	\N	EPI2025_002	/objects/uploads/fec322ab-51c2-420d-afa1-c71b27933c27
2ec6bc0b-ad4b-407f-8db6-5beb7cf94045	b284ef85-031b-4f2a-a97a-c1d4ee160086	Buzo desechable	\N	\N	2025-10-10	\N	\N	EPI2025_003	\N
b8664adc-9ed9-40a1-9f9c-3b4776755f6b	b284ef85-031b-4f2a-a97a-c1d4ee160086	Mascarilla carbono desechable	\N	\N	2025-10-10	\N	\N	EPI2025_004	\N
820b4d02-e951-4e94-9013-883dd3589edf	b284ef85-031b-4f2a-a97a-c1d4ee160086	Gafas de seguridad	\N	\N	2025-10-10	\N	\N	EPI2025_005	\N
69413630-5931-450b-a459-be27012ba060	8d86c9ae-e4ab-460b-81a1-f2ae1b4421cb	Guante Protección Riesgos Mecánicos	\N	\N	2025-10-07	\N	\N	EPI2025_006	\N
9393c90a-76f6-4597-90b7-986e15f40320	b74b1e7c-0b36-4e5f-a50f-986cc0a5c925	Guante Protección Riesgos Mecánicos	\N	\N	2025-09-29	\N	\N	EPI2025_009	\N
59e0a974-fef8-4c58-9f60-572b4dd6d5dc	8d86c9ae-e4ab-460b-81a1-f2ae1b4421cb	Buzo desechable	\N	\N	2025-11-06	\N	\N	EPI2025_010	\N
d249135f-a5d2-4b42-b9f8-6254f06c86c3	7d5041af-0126-48b4-8a5a-fea24ac06fb0	Guante Protección Riesgos Mecánicos	\N	\N	2025-10-03	\N	\N	EPI2025_007	/objects/uploads/bfbfa3d7-7c97-47e2-b087-175462144474
4f269290-b555-44fc-8ecf-fccf886535ae	7d5041af-0126-48b4-8a5a-fea24ac06fb0	Buzo desechable	\N	\N	2025-11-12	\N	\N	EPI2025_011	/objects/uploads/21ee60ca-3add-47ef-8740-74f2daa3d82a
8697571e-767c-430e-8888-5bbf804ceff0	37d81fcb-baea-4f86-bfa1-49e547279e8d	Guantes para soldar	JUBA	40840	2025-10-03	\N	\N	EPI2025_008	/objects/uploads/41933590-309b-4223-9965-615b9fe7b768
83d38313-2e96-4bbe-940e-855825976b2b	b105ccce-bf46-491d-b580-a03114439ff3	Guantes protección impermeables	\N	\N	2026-01-02	\N	\N	EPI2026_001	\N
bfc7c11e-e6e5-4aca-ab9c-0d1152458ec2	05c8869b-6418-4a71-8da7-51583df6c2f5	Guante Protección Riesgos Mecánicos	\N	\N	2026-01-05	\N	no firma	EPI2026_002	\N
e76c7c8a-dd6f-4a4b-a6b5-18d01122e3b5	b105ccce-bf46-491d-b580-a03114439ff3	Guante Protección Riesgos Mecánicos	\N	\N	2026-01-07	\N	\N	EPI2026_003	\N
cf8afbb3-fbf0-461a-96d0-4b21b139cac7	b74b1e7c-0b36-4e5f-a50f-986cc0a5c925	Guante Protección Riesgos Mecánicos	\N	\N	2026-02-03	\N	NO FIRMA	EPI2026_004	\N
46096dac-a7ad-470b-9d30-35406b884774	b74b1e7c-0b36-4e5f-a50f-986cc0a5c925	Guante Protección Riesgos Mecánicos	\N	\N	2026-02-03	\N	NO FIRMA	EPI2026_005	\N
bdc5ce4e-cfbc-4635-8285-cc1a398d8671	b284ef85-031b-4f2a-a97a-c1d4ee160086	Guante Protección Riesgos Mecánicos	\N	\N	2026-02-13	\N	NO FIRMA	EPI2026_006	\N
040a75b3-675d-41a9-905f-5ffe76c95c6e	b74b1e7c-0b36-4e5f-a50f-986cc0a5c925	Buzo desechable	\N	\N	2026-03-17	\N	NO FIRMA	EPI2026_007	\N
3ea00349-5933-4818-9941-6c9464a131db	08b6f03e-d1f8-43a3-9962-aeecb489b917	Buzo desechable	\N	\N	2026-03-10	\N	\N	EPI2026_008	\N
0c949655-775f-41c4-9b08-c448734954a4	08b6f03e-d1f8-43a3-9962-aeecb489b917	Mascarilla de carbono desechable	\N	\N	2026-03-10	\N	\N	EPI2026_009	\N
876adaec-adb3-4942-b36b-ed19a2315e63	b284ef85-031b-4f2a-a97a-c1d4ee160086	Buzo desechable	\N	\N	2026-04-23	\N	\N	EPI2026_011	\N
f420a9ba-6dbd-4c67-b776-6ae798faff68	7d5041af-0126-48b4-8a5a-fea24ac06fb0	Buzo desechable	\N	\N	2026-04-14	\N	\N	EPI2026_012	\N
13ecc006-55b7-41cc-b79b-c2fc3d0aa3c3	7d5041af-0126-48b4-8a5a-fea24ac06fb0	Guante Protección Riesgos Mecánicos	\N	\N	2026-04-29	\N	Pendiente de firma	EPI2026_013	\N
be0f6c4c-6b7f-45d3-856a-2cc19a9fdfde	08b6f03e-d1f8-43a3-9962-aeecb489b917	Guante Protección Riesgos Mecánicos	\N	\N	2026-05-07	\N	Pendiente de firma	EPI2026_014	\N
07a4f8b5-d0a9-475d-b797-dbae84342b44	b284ef85-031b-4f2a-a97a-c1d4ee160086	Mascarilla de carbono desechable	\N	\N	2026-05-12	\N	\N	EPI2026_015	\N
d597a7d5-8b47-4d0c-ab7e-26de5452d30e	08b6f03e-d1f8-43a3-9962-aeecb489b917	Ropa de protección, calzado y guantes de protección frente a cortes.	\N	\N	2026-05-12	\N	Perneras anticorte motosierra	EPI2026_016	\N
c27ddda1-92c0-4727-9dca-d70d78772b70	08b6f03e-d1f8-43a3-9962-aeecb489b917	Guante Protección Riesgos Mecánicos	\N	\N	2026-03-09	\N	\N	EPI2026_010	/objects/uploads/b58316b8-7fff-4016-a412-7b01ff0ce1fb
1b8f2191-d2f6-4d1a-9c69-4a6dd8613ac2	b284ef85-031b-4f2a-a97a-c1d4ee160086	Buzo desechable	\N	\N	2026-06-10	\N	\N	EPI2026_017	\N
\.


--
-- Data for Name: epis_fichas_ev; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.epis_fichas_ev (id, nombre_epi, fecha_creacion) FROM stdin;
e37ff543-3036-4f3e-ae6d-f84b94ce1ee0	Calzado de Seguridad con Puntera de Protección (Bota)	2025-10-20 06:24:17.718104
38ce95fe-fa7a-460b-ab80-4bab7a998f0e	Casco de Seguridad	2025-10-20 06:24:23.402625
158242d5-a74f-45b3-aa1c-d74af994ae6a	Guante Protección Riesgos Mecánicos	2025-10-20 06:24:32.80559
230d05fa-d1bb-493f-8a16-0b0582a43e96	Gafas de seguridad y/o pantalla de protección facial	2025-10-20 06:26:28.263733
f7231496-6574-4111-b328-c94c5d742ec1	Cascos de protección auditiva	2025-10-20 06:26:32.560605
11ed2de2-dab9-4da4-bde7-e3d51ec18418	Guantes para soldar	2025-10-20 06:28:15.194773
08e99e30-67a4-4da4-b3c6-194dd5d2129e	Mascarilla con filtro de protección respiratoria tipo FFP2	2025-10-20 06:30:05.202864
9d2454f8-c29d-488a-8f52-8d76ecb09a05	 Guantes de protección anticortes	2025-10-20 06:34:01.125248
27c154f0-d304-4b2f-8104-803c4b5ed0c5	Ropa de protección, calzado y guantes de protección frente a cortes.	2025-10-21 06:03:19.248794
2775456a-ec00-4d86-b09e-2ea9837a5d8c	Chubasquero A.V.	2025-10-23 06:35:51.577623
7d28f94a-6798-4a12-ba6f-e062a74ad172	Vestuario de Protección alta visibilidad (EN 471)	2025-10-23 06:50:36.397545
1be02eb5-8dcf-4bdf-a254-c7dd36891726	Gafas de seguridad	2025-10-23 11:38:54.063919
3e96e879-c998-49d8-916a-249566138939	Protección caídas desde altura: Línea de anclaje	2025-10-23 11:39:08.575919
f18a1ed3-faa7-4127-9a5f-920cb87c8d36	Protección Caídas en Altura: Arnés Protección	2025-10-23 11:39:16.243642
b317c170-e4d3-4ea0-a9be-425a161e5e66	Buzo desechable	2025-10-30 07:29:39.494865
635f9b50-ef6d-450e-a20f-32d236005b0a	Mascarilla de carbono desechable	2025-11-04 08:02:06.419454
c72e2507-ed40-452b-b7ba-a3a83bd57434	Botas de seguridad	2025-11-10 11:44:57.851354
b99bd4df-1e6c-44a0-b14f-de3b3820512f	Mascarilla de protección	2025-11-10 11:45:06.597182
e3dbe28d-a015-4074-9bff-c415d045defd	Cinturón abdominal antivibratorio	2025-11-10 11:49:21.221423
84ef8925-0c2f-4ad0-8ce1-0837d93d8d82	Botas altas impermeables	2025-11-10 11:56:10.188831
faf22371-ebae-41ac-9b4d-40c326e4cb11	Guantes protección impermeables	2025-11-10 11:56:23.433648
4d931a85-ac3f-46f1-9775-25606d6579ee	Tapones protección auditiva	2025-11-10 12:17:17.454317
\.


--
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipos (id, marca, modelo, fecha_adquisicion, ficha_evaluacion_url, manual_url, imagen_url, fecha_creacion, nombre, numero_serie, zona_id) FROM stdin;
a9eaac76-b6c0-4fa1-9e74-6b555d3510e4	STHILL	FS 310	2014-01-01	/objects/uploads/2d1db7ed-6d48-4ff3-b1cc-6190dc930edd	\N	\N	2025-10-21 06:02:32.579929	Desbrozadora STHILL FS 310	001	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
a5118fe0-c48f-4489-ab10-32c6b790dd7b	Reanult / Hiab	Midlum 220 / 055 Duo	2006-01-01	/objects/uploads/aa617915-d053-4bd5-af17-12a983511be3	\N	\N	2025-10-23 06:49:57.059008	Camión Basculante con Grua 5757-DYS	VF647BCA000002334	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
b79c0ded-96f8-4a22-b4a3-e986f35f5bb5	Renault Midliner	M-210-15-D	1996-12-13	/objects/uploads/ec8ad799-0543-476c-a53d-a690caf38a3e	\N	\N	2025-10-23 06:54:20.0938	Camión Basculante con Grua AB-7083-P	VF640ACB000004807	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
82775268-67e2-4015-947c-663d6fad1db4	SDMO	HX 4000	2015-01-01	/objects/uploads/4218d220-c89b-453f-883b-cfb0e9fab2a4	\N	\N	2025-10-23 07:40:23.91267	Grupo electrógeno 	3383533-069	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
16086a56-4244-42d0-8111-2fff770f195b	STHILL	HT 131	2014-01-01	/objects/uploads/dddf11c7-4ae1-4f52-add5-ba1674960d2c	\N	\N	2025-10-23 11:31:52.602897	Podadora de altura	298488697	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
709dceaa-1fa8-4ba4-9b08-fdfcd6d55378	GILETTA	HF4035D	2006-01-01	/objects/uploads/2d886be8-66b0-487d-a118-9aef903878e5	\N	\N	2025-10-23 11:38:18.983519	Esparcidora de fundentes 5757-DYS	HF.445E150R	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
7658043e-7916-49d0-bb5e-97821b4e20fb	ASSALONI	TECNA 30	2006-01-01	/objects/uploads/802d3110-a93a-45ad-af27-d6bb6a559494	\N	\N	2025-10-23 11:42:10.927502	Cuchilla quitanieves 5757-DYS	AA004267	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
c5ff78a3-97e4-4448-bc41-1149a9f884f0	SANSON 	32	1980-01-01	/objects/uploads/add41539-70ba-4ff8-b853-6f550be9fb16	\N	\N	2025-11-10 11:44:11.529092	Taladro Vertical	001	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
d24fc44d-0b93-4c29-8fe1-ee1273e79da6	CASE	580K	1991-01-21	/objects/uploads/36f15e9d-92f7-40ad-a00e-0ffa8d335868	\N	\N	2025-11-10 11:48:36.515877	Retropala Mixta AB-36354-VE	001	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
ee6e5f6d-486c-4d2b-ade7-b228f2f03774	GILLETA	HF.4035D	1997-01-01	/objects/uploads/eabd59aa-a78c-48bc-bc94-3fe2650961ee	\N	\N	2025-11-10 12:20:15.246852	Esparcidora Fundentes AB-7083-P	HF.961010BF	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
fba1d158-53c4-442f-9094-ebce8923d493	CATERPILLAR	12-H	2007-01-01	/objects/uploads/4efed81c-280f-4e0e-a35c-c45bf33ad292	\N	\N	2025-11-10 12:16:50.156076	Motoniveladora 0842-BDZ	CAT0012HTCBK01315	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
f36760c1-f0c4-4deb-9616-31f9f8550ea7	CITROËN	Berlingo	2009-01-01	/objects/uploads/5eb8e47d-7ff8-4dfd-9058-e24a306bea48	\N	\N	2025-11-10 12:12:06.292492	Furgoneta 8883-GRF	VF77J9HTC9J147902	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
e9f8e903-99f6-4445-8821-f7215c6f165f	BOSCH	GBH7-45-DE	2000-01-01	/objects/uploads/ee9f784d-9dd2-48bf-931e-ff99417ed225	\N	\N	2025-11-10 11:53:05.990317	Martillo compresor	611233803	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
263afb4e-301e-49ce-a359-260deb475ec8	SWL	Cmu 2000	2020-01-01	/objects/uploads/82ea41a5-68cf-4e36-9878-096882a579bb	\N	\N	2025-11-10 12:23:34.007343	Eslingas	001	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
26ad8c50-0a43-4d6d-a8cd-a2a41309c227	Varios	Varios	2020-01-01	/objects/uploads/202fb35e-f615-45eb-b4c7-f8c2d87c8454	\N	\N	2025-11-10 12:25:22.796297	Escaleras	001	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
bf477fe6-8ea8-46cc-bd9e-f60ace0e836b	KARCHER	HD650	2015-01-01	/objects/uploads/5c136cd1-2aab-4f35-96c7-cbad3c40549a	/objects/uploads/ddff2930-5108-47e8-bc5b-ea2fd274f6fa	\N	2025-11-10 11:55:42.794701	Hidrolimpiadora	404284	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51
\.


--
-- Data for Name: equipos_epis_obligatorios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipos_epis_obligatorios (id, equipo_id, epi_ficha_ev_id) FROM stdin;
8adf6628-96bd-4ee9-91f4-1d8307206515	a9eaac76-b6c0-4fa1-9e74-6b555d3510e4	f7231496-6574-4111-b328-c94c5d742ec1
dfce8157-3640-47c5-a98e-85cccdadf5af	a9eaac76-b6c0-4fa1-9e74-6b555d3510e4	230d05fa-d1bb-493f-8a16-0b0582a43e96
6afee788-a1e7-4b05-a8c8-6f4827ad68c3	a9eaac76-b6c0-4fa1-9e74-6b555d3510e4	27c154f0-d304-4b2f-8104-803c4b5ed0c5
d616915a-db3a-4fbd-8ea0-92faa133f7ea	a5118fe0-c48f-4489-ab10-32c6b790dd7b	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
80e3686a-7851-4bb3-91c2-f334b024faaa	a5118fe0-c48f-4489-ab10-32c6b790dd7b	158242d5-a74f-45b3-aa1c-d74af994ae6a
09929cc5-8ee9-4dec-92d5-99261ccf36da	b79c0ded-96f8-4a22-b4a3-e986f35f5bb5	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
b0246013-7509-494c-8669-e85922ade8b3	b79c0ded-96f8-4a22-b4a3-e986f35f5bb5	158242d5-a74f-45b3-aa1c-d74af994ae6a
ea3d03b3-e688-45c6-bd28-2fea035d6537	b79c0ded-96f8-4a22-b4a3-e986f35f5bb5	7d28f94a-6798-4a12-ba6f-e062a74ad172
0f0d2e76-db37-481f-bb3e-69b988f2d99a	82775268-67e2-4015-947c-663d6fad1db4	f7231496-6574-4111-b328-c94c5d742ec1
ec0eea10-8578-4b70-a990-e09b858ab6ea	16086a56-4244-42d0-8111-2fff770f195b	230d05fa-d1bb-493f-8a16-0b0582a43e96
879b1993-dbb8-4867-89f8-9725c77fdece	16086a56-4244-42d0-8111-2fff770f195b	f7231496-6574-4111-b328-c94c5d742ec1
005befcd-bfc7-4882-adef-8d96046e0f36	16086a56-4244-42d0-8111-2fff770f195b	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
b65b0235-21a9-4098-9468-076b7a947ef7	709dceaa-1fa8-4ba4-9b08-fdfcd6d55378	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
72d9420a-a125-4cae-936d-521a1d973d70	709dceaa-1fa8-4ba4-9b08-fdfcd6d55378	7d28f94a-6798-4a12-ba6f-e062a74ad172
118a8697-b9d3-4df4-8ce0-39c16c9e0f03	709dceaa-1fa8-4ba4-9b08-fdfcd6d55378	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
1adb3896-02f5-4f8d-94da-8e85a85368a6	709dceaa-1fa8-4ba4-9b08-fdfcd6d55378	158242d5-a74f-45b3-aa1c-d74af994ae6a
04dfc1b5-5c36-4043-b0cb-ac8d552107de	7658043e-7916-49d0-bb5e-97821b4e20fb	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
ca7a8de1-5b50-4787-b524-e2ccd7d8a6b8	7658043e-7916-49d0-bb5e-97821b4e20fb	158242d5-a74f-45b3-aa1c-d74af994ae6a
803791e9-41fa-42e7-a48f-19fbdbce8ede	7658043e-7916-49d0-bb5e-97821b4e20fb	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
f7235be8-4f0b-4446-910e-758f608c3dca	7658043e-7916-49d0-bb5e-97821b4e20fb	7d28f94a-6798-4a12-ba6f-e062a74ad172
d81d210b-5568-4528-ad56-ad18694cd0bf	c5ff78a3-97e4-4448-bc41-1149a9f884f0	f7231496-6574-4111-b328-c94c5d742ec1
a0c06251-f0f9-4b01-9e04-eb99c55829b4	c5ff78a3-97e4-4448-bc41-1149a9f884f0	230d05fa-d1bb-493f-8a16-0b0582a43e96
2beaf52a-92fa-441c-beb5-886319550232	c5ff78a3-97e4-4448-bc41-1149a9f884f0	c72e2507-ed40-452b-b7ba-a3a83bd57434
af9cf8e8-cc9b-4f62-9cfe-4a679daab72a	c5ff78a3-97e4-4448-bc41-1149a9f884f0	b99bd4df-1e6c-44a0-b14f-de3b3820512f
7eb74b28-c68e-4f76-be8f-83ccad865089	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
a4a11921-e6db-4a9f-9037-6c66fbbfa95d	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
745759ab-78ce-42fe-99bd-d5e9ca99e81f	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	f7231496-6574-4111-b328-c94c5d742ec1
69b45849-4ee8-495e-b80e-72d94b421fc8	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	1be02eb5-8dcf-4bdf-a254-c7dd36891726
2ba85684-f66c-471b-991d-ee1710bc4a47	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	158242d5-a74f-45b3-aa1c-d74af994ae6a
10a83079-5787-4e6a-87c6-cee919f2ff31	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	7d28f94a-6798-4a12-ba6f-e062a74ad172
a0a3db4f-7602-467f-b853-164404fc1743	d24fc44d-0b93-4c29-8fe1-ee1273e79da6	e3dbe28d-a015-4074-9bff-c415d045defd
fdbe6ede-145d-44c3-877f-98f63575528e	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
142fd33c-8f7b-4dd0-adcc-ab58e44d3b8a	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
12b00b19-97b8-49aa-8ea1-b4a6bab508bd	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	1be02eb5-8dcf-4bdf-a254-c7dd36891726
7cecd72f-7bb5-4c3c-8aba-80a301c99905	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	158242d5-a74f-45b3-aa1c-d74af994ae6a
252f951c-65d9-4951-8ed6-18cd9705a46f	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	f18a1ed3-faa7-4127-9a5f-920cb87c8d36
167c8a4d-e1e2-41f6-a62f-98e1bc312e9f	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	3e96e879-c998-49d8-916a-249566138939
f5c6f151-9e02-4d2c-aa16-701dbe00b3e4	ee6e5f6d-486c-4d2b-ade7-b228f2f03774	7d28f94a-6798-4a12-ba6f-e062a74ad172
80cc740e-005c-4260-af40-cf9c347e0658	fba1d158-53c4-442f-9094-ebce8923d493	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
f73b7296-0256-4218-b7df-0311d26473f7	fba1d158-53c4-442f-9094-ebce8923d493	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
24669574-6558-4c83-80ae-98aedbc6e4d8	fba1d158-53c4-442f-9094-ebce8923d493	1be02eb5-8dcf-4bdf-a254-c7dd36891726
cf8bc086-e95d-48e2-a06d-47b56a2da586	fba1d158-53c4-442f-9094-ebce8923d493	158242d5-a74f-45b3-aa1c-d74af994ae6a
7b9625fa-fa32-4809-a82d-7241bbf95c7c	fba1d158-53c4-442f-9094-ebce8923d493	b99bd4df-1e6c-44a0-b14f-de3b3820512f
5917870e-22df-40de-bac2-f805e74eeae8	fba1d158-53c4-442f-9094-ebce8923d493	4d931a85-ac3f-46f1-9775-25606d6579ee
66d70091-4ccf-4060-9d70-a35836770a88	f36760c1-f0c4-4deb-9616-31f9f8550ea7	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
39c746af-ee9d-41b9-98d6-76b58d625835	f36760c1-f0c4-4deb-9616-31f9f8550ea7	158242d5-a74f-45b3-aa1c-d74af994ae6a
e9bbc49f-59b8-441f-9756-d4b0e46699b1	f36760c1-f0c4-4deb-9616-31f9f8550ea7	7d28f94a-6798-4a12-ba6f-e062a74ad172
2f05bfd2-1a77-4866-8aaa-e68f4f44f523	e9f8e903-99f6-4445-8821-f7215c6f165f	f7231496-6574-4111-b328-c94c5d742ec1
018dea10-74de-486d-a5d2-8b864921df3a	e9f8e903-99f6-4445-8821-f7215c6f165f	1be02eb5-8dcf-4bdf-a254-c7dd36891726
d622dcfd-ad12-4f63-9d6c-39e8f68e45ed	263afb4e-301e-49ce-a359-260deb475ec8	e37ff543-3036-4f3e-ae6d-f84b94ce1ee0
6896e0d0-254c-42c1-a144-e645bf0e7b33	263afb4e-301e-49ce-a359-260deb475ec8	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
2ab91209-b016-4d6b-9682-8e1fe840f281	263afb4e-301e-49ce-a359-260deb475ec8	158242d5-a74f-45b3-aa1c-d74af994ae6a
b229d554-2d5d-4111-b86e-77f8f325f849	26ad8c50-0a43-4d6d-a8cd-a2a41309c227	c72e2507-ed40-452b-b7ba-a3a83bd57434
33a5fc47-647c-4aa6-99ae-d43fd0a434d2	26ad8c50-0a43-4d6d-a8cd-a2a41309c227	38ce95fe-fa7a-460b-ab80-4bab7a998f0e
2bfb08e6-0941-43f3-bf46-f009bffabfd4	26ad8c50-0a43-4d6d-a8cd-a2a41309c227	158242d5-a74f-45b3-aa1c-d74af994ae6a
e7fd955c-00a1-4254-8e48-4ff5e1dc1e72	26ad8c50-0a43-4d6d-a8cd-a2a41309c227	f18a1ed3-faa7-4127-9a5f-920cb87c8d36
8465c28f-8258-4398-b52d-7e4a41df8d5d	26ad8c50-0a43-4d6d-a8cd-a2a41309c227	3e96e879-c998-49d8-916a-249566138939
97e85a37-9370-4ec6-b978-9e8f125f0898	bf477fe6-8ea8-46cc-bd9e-f60ace0e836b	84ef8925-0c2f-4ad0-8ce1-0837d93d8d82
e93af256-7599-4055-845b-eb9cd44bdbfe	bf477fe6-8ea8-46cc-bd9e-f60ace0e836b	1be02eb5-8dcf-4bdf-a254-c7dd36891726
8f9a3f2f-b52b-46e1-b4a1-64fbd6cf5354	bf477fe6-8ea8-46cc-bd9e-f60ace0e836b	faf22371-ebae-41ac-9b4d-40c326e4cb11
b6b738b4-1a1f-45c4-ac55-4d86e01c2bdc	bf477fe6-8ea8-46cc-bd9e-f60ace0e836b	b99bd4df-1e6c-44a0-b14f-de3b3820512f
\.


--
-- Data for Name: fichas_seguridad_productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fichas_seguridad_productos (id, nombre, marca, modelo, archivo_url, nombre_archivo, fecha_creacion) FROM stdin;
74d94b2b-aab5-4707-953f-9741cf4b153d	Aglomerado asfáltico en frío	2R	Fraguado en frío	/objects/uploads/dbb16e11-3c81-452b-8088-34638c6e3fb1	\N	2025-10-21 09:45:16.790683
0448a3be-3cae-4d69-9d49-868e3494d80d	Jabón de manos 500ml	KIRIKO	Frutos Rojos 500 Ml.	/objects/uploads/b60468fc-d616-4072-bfa2-e08af777e2a3	\N	2025-10-21 09:46:14.127343
796d8d74-825b-4872-9856-6e1a00f662f3	HP Super, aceite de motor.	STIHL	Aceite mineral altamente refinado (IP 346 DMSO Extracto < 3%) y aditivos	/objects/uploads/9cbbc115-3095-4f91-815d-43708ee226e8	\N	2025-11-10 09:36:51.649886
2e9119b6-bca9-4e0c-87ca-fac8e81c5240	Aceite Lubricante ERTOIL	CEPSA	 S.M. 10W40 SINT. 68138	/objects/uploads/a4a5b892-0957-4441-8607-2be87012299b	\N	2025-11-10 10:00:37.324963
4ad30f74-c190-4a01-92ca-68ae208ed4e8	Desincrustante 	ZORELOR	ZOREL-TOP 2123000	/objects/uploads/5c88275d-af62-4457-b7f1-b5de37ce1289	\N	2025-11-10 10:05:10.903514
c0a9c179-d9d4-4e3e-8d30-e0d0f4612e8c	Protección anticorrosiva	WD-40	Multi-Use-Product	/objects/uploads/820766bd-b746-433c-a059-c02f57cce8a7	\N	2025-11-10 10:06:47.086317
a425f69a-36a9-403a-b8e5-6da6598f68c7	Aceite multiuso 5-56 PRO	5-56 PRO	BDS001958_6_20170629 (ES)	/objects/uploads/425ada66-49af-493e-a2f2-434936e5ce20	\N	2025-11-10 10:12:37.453587
e89ed525-0e54-4bb4-9cdd-583b4f3cec2b	Pintura acrílico tráfico ciudad	TKROM	501010001 Blanco	/objects/uploads/3d7ed0e5-7737-48da-a786-6effe741fd1b	\N	2025-11-10 10:14:03.848645
e93f69db-171a-4510-b468-280f22ce93f5	Esmalte sintético con poliuretanos	TKROM	FDS-6325	/objects/uploads/2230bf7b-d3fd-4a43-bcf7-57074bf404fb	\N	2025-11-10 10:15:12.051051
78bdacec-558d-4d72-b850-1b415ad636ac	Esmalte sintético con poliuretano brillo	TKROM	634010044	/objects/uploads/8ef7a5c6-32c2-4a6e-ad4b-986838bdf2bf	\N	2025-11-10 10:16:26.644762
d0d8ba76-673c-4af8-97a4-a0efb09fa456	Aceite para cadena motosierra	Krafft	LUBE MOTOSIERRAS OIL 1L	/objects/uploads/e1f336b6-8d14-4551-92b8-a379a951f062	\N	2025-11-10 10:17:17.693515
88c2fbc5-0dd7-467b-8271-300cfc0cad61	Aflojatodo	CRC Industries	Lubircante enfriador afloatodo	/objects/uploads/d07c92b7-f024-4df8-89af-a5ef7ba42b59	\N	2025-11-10 10:18:25.749765
269d8ca9-9647-4d06-a36b-7cf6f2fa7941	Aflojatodo Multiusos 400 ml	COFAN	1500 0001	/objects/uploads/2af51593-1090-4dcd-a8fb-c4386f20a135	\N	2025-11-10 10:19:00.988322
66653d56-04ad-493e-961a-93daff24358b	Aguafuerte Salfumant	LA TUNA	Cód. 0802001	/objects/uploads/148c73b2-c697-4e75-ba02-a453b7ef34a6	\N	2025-11-10 10:19:43.711206
bafacbe0-5853-499e-b98c-71c8a15ef204	Aguarras	GTM	4	/objects/uploads/802e2e46-d109-442d-880b-f771b0b9d825	\N	2025-11-10 10:21:19.973662
42b0cfae-cad3-41ea-a61d-f466fc375867	Anticongelante	LIV	C.C. 50%	/objects/uploads/7d07d81b-2744-4bb1-aea5-1004a4e959bd	\N	2025-11-10 10:22:08.996565
46dbd18d-0024-4615-9f61-f615206b92de	Desinfectante	Químicas Gómez	BIHOGOM SANIBAC	/objects/uploads/95d6e278-3614-477d-8050-379ae5bfc77b	\N	2025-11-10 10:22:55.109917
4ef7b2f7-9918-4fee-b7b4-87679d02dafb	Aceite Lubricante CEPSA	CEPSA	EUROTECH LS 10W40 PLUS	/objects/uploads/52c491a6-e12e-42e6-b1af-dc583c2d709e	\N	2025-11-10 10:23:30.405676
2f28b48e-0fab-4e14-b9a7-440c305a753d	Cristasol	Brandcare	Cristalino	/objects/uploads/f25ab663-b216-4a91-801d-2d672d236f59	\N	2025-11-10 10:24:30.453177
918f301f-455c-4896-8115-6842cf77be53	Desinfectante Bactericida y Viricida	Químicas Gómez	BIHOGOM SANIBAC	/objects/uploads/2a3e9df4-5220-46ad-9155-fdd1cdc97608	\N	2025-11-10 10:25:42.944214
cb9f5fa3-f304-45e9-be8f-f5ab63a46f23	Anclaje químico 	FISCHER	FIS PE 300 SF	/objects/uploads/b8bb340e-bf83-474e-b504-6e3abe99af3e	\N	2025-11-10 10:26:30.65418
9debf566-0b0e-41ab-9d95-ca47a9803957	Limpiador Baños	Adis higiene	G3	/objects/uploads/69123151-cec6-4515-bb22-16f805088588	\N	2025-11-10 10:27:38.527299
3c431fdd-a164-4fb3-aaae-cf2d9ecb1d2c	Anticorrosivo	Galva Brite	BDS000214_6_20130621	/objects/uploads/3d70c774-a58f-46c5-a741-6ad465998dd9	\N	2025-11-10 10:28:22.581929
f7f0f65c-b3b5-4e8f-b6d2-53b6041a33db	Grasa 	Silvergras 	4402	/objects/uploads/ef6836cb-1dca-4b86-99d2-d97485d83511	\N	2025-11-10 10:29:08.057097
3b08157c-9c41-43b9-b847-fc7a1663120d	Grasa	Silvergras 	4403	/objects/uploads/34ce8231-0565-4500-8799-b1d5176c8d39	\N	2025-11-10 10:29:27.347534
fa0837b1-f8ef-483d-9c89-1753b46c0ac7	Glifosato 36%	ADAMA	36% Sal isopropilamina	/objects/uploads/5e7423b5-d0ec-4ebb-9f1b-17f947c3a230	\N	2025-11-10 10:30:33.939921
84913b81-9c48-4b0e-b45a-151c559ea307	Lubricante	SilverOil	HIDRASIL SIFLUID 68EP	/objects/uploads/2cf31b4d-4089-4428-9fd7-017c84ae78e8	\N	2025-11-10 10:31:36.418962
77238d59-bf2d-4bc3-8faa-ca93b0221b7c	Herbicida	KEYFORTIN	MSDSKEY 239	/objects/uploads/02da192e-ed4f-464e-8ff3-54b30bfd6b19	\N	2025-11-10 10:32:50.679739
7fbd5e58-a0e4-4562-a3e9-39b47028755a	Limpiacristales	Adis higiene	G3	/objects/uploads/f69fbce7-a2f0-4fc2-9967-418f7118c6ba	\N	2025-11-10 10:33:32.104155
0c5cb79d-739f-4b19-b380-82e7c19ddcce	Revestimiento Rugoso	Químicas Mendieta	530003	/objects/uploads/462e712c-1562-4919-917d-d0bb458b909c	\N	2025-11-10 10:34:24.084763
ce3dd5bd-0bac-4052-a829-5eb20034bcda	Lavamanos	Krafft	FAST ORANGE HAND CLEANER 3.78L	/objects/uploads/c0d5d1fb-1049-4887-9df2-daa1b15badf2	\N	2025-11-10 10:35:12.671217
63151926-7c04-4a4e-b802-27d098c1fdc2	Recubrimiento suelos	Química 2000 S.A.	BM-2114-A	/objects/uploads/b1baa259-1b87-438e-a2b0-f908e96a4ebe	\N	2025-11-10 10:35:54.459502
2adcaf3e-e214-4a72-8984-dd893c5e3d1a	Sal deshielo	Mariano Piñero	Sal granel	/objects/uploads/fd7d4945-6d4c-4c95-8610-78f740522737	\N	2025-11-10 10:36:43.517906
ca53c95d-1e46-4544-8f2a-67b438276e8f	Gel Hidroalcohólico	Químicas Gómez	SANIBAC	/objects/uploads/ea47fd5a-b864-4b68-9fc1-5cde1c78a158	\N	2025-11-10 10:37:28.821742
d2e388a8-e556-472d-bbd2-4861bcbe712c	Sepiolita	SP	15/30	/objects/uploads/f1327b37-e6b8-4b00-b6cb-228ab69cf6c8	\N	2025-11-10 10:38:01.952061
09226dd7-22ae-4295-97c3-824e18ec8f4d	Cemento	LafargeHolcim	Gris	/objects/uploads/3c73f7c7-9d71-486e-ab42-d383544f8305	\N	2025-11-10 10:41:35.388109
d54bab07-ed57-421e-9a93-6091eb75d77b	Lavaparabrisas	LIV	-20ºC	/objects/uploads/92ae9353-7974-44a4-b913-5ec53da457ae	\N	2025-11-10 10:44:10.334424
617714e0-afcb-4559-9215-f3c76e8e7cd2	Solid Glass Beads	SBP	Echostar	/objects/uploads/1a7a1624-35d4-43e3-9c15-eb8e423d3fd7	\N	2025-11-10 10:45:52.084288
e46cf992-2b9e-4184-aa7e-10a10d8053c9	Recubrimiento suelos	IONSA	Hermetic A	/objects/uploads/e0720972-c81e-4819-a6a3-649e9ddab749	\N	2025-11-10 10:49:05.932385
7c5f3781-44c4-41d3-8691-c5014aff495d	Recubrimiento suelos	IONSA	Hermetic B	/objects/uploads/1dc1c70c-294b-4d45-bd4d-5e056732311f	\N	2025-11-10 10:49:39.269647
b764e416-e9a3-4a6a-8efa-a967e5225c23	Disolvente universal	Disopol	DRP16-0068006	/objects/uploads/97b2ab62-198d-430f-ba73-6c40a34eff7e	\N	2025-11-10 10:50:20.541213
f4f75594-8b9d-442c-852d-aa46896799e9	Esmalte sintético	MACY	61035	/objects/uploads/8a940fcd-34a0-4e61-83b1-5fbefbea4981	\N	2025-11-10 10:50:54.093208
6af70866-993c-46e1-a538-d0e3a6b2e468	Autoarranque	Krafft	12604 270ML	/objects/uploads/782d5b58-62b3-44d7-9ad2-88767ffef715	\N	2025-11-10 10:52:54.903616
11219ddd-1a3e-475f-8e48-2fd1a5751396	Limpia salpicaderos	Krafft	14146 - 520ML y BAYETA	/objects/uploads/0a7573f9-1038-4ab1-943d-8acc0bbfd2ee	\N	2025-11-10 10:53:32.829768
9d036b15-19c6-4516-85d6-688f3e6b7f55	Limpia parabrisas	LIV	LIV -20º	/objects/uploads/84f8981b-ad47-4aec-9336-c093e936665f	\N	2025-11-10 10:54:22.749331
81f3e838-0088-4b9c-b6e7-0cadc7d8aa71	Alcohol de quemar	MPL	Metanol 67-56-1	/objects/uploads/4b4310fb-e486-4035-977e-85c0556b568a	\N	2025-11-10 10:55:03.36549
e09949ec-e878-4749-b104-6b4513f82357	Imprimación sintética	TKROM	FDS-6201	/objects/uploads/e495a33b-2928-4f5e-8138-596d081d1607	\N	2025-11-10 10:55:43.096951
35c60176-b017-4298-a067-6ebe508c7930	Imprimación anticorrosiva	Química 2000 S.A.	TRANSFERRION (BOTE)	/objects/uploads/e64a702d-18ef-4941-adaa-54dea8fdf830	\N	2025-11-10 10:56:26.696386
17b8df45-acd6-422e-a461-a279095fc326	Diesel	Repsol	Gasoleo e+	/objects/uploads/8f60267b-b93a-4787-a4f5-39259acb6628	\N	2025-11-10 10:57:04.434076
2c2691b7-92fd-4d99-97bd-dc8628ca84c8	Gasolina	Repsol	Sin Plomo 95	/objects/uploads/26af29a9-389c-44b9-8656-90e9cdd7dd40	\N	2025-11-10 10:57:40.164016
572da17b-0103-462e-b257-9a4cf34a5638	Aceite lubricante	Repsol	Super Turbo Diesel 15W40	/objects/uploads/de887156-d878-411a-afb5-f6c2fbe929cb	\N	2025-11-10 10:58:29.542907
80fd3046-4038-4a4f-b3bd-5cfa164c4099	Liquido frenos	SilverOil	DOT-4	/objects/uploads/517e6b50-e0e0-4a2d-b5b8-45412758a812	\N	2025-11-10 10:58:59.905585
0485ab4f-0f03-4529-ab10-7d275188a687	Aceite transmisión	SilverOil	HIDRASIL DEXRON III	/objects/uploads/51b6356f-fa2f-431d-8adc-f883e7dd951b	\N	2025-11-10 10:59:37.010035
6959f14a-0ab5-4e6d-ba94-dc861a9a78ee	Anticongelante	WABCO	WabcoThyl	/objects/uploads/0c99d35c-2457-49a9-92bf-e6a20fa6cb3b	\N	2025-11-10 11:00:41.790556
3c513320-22fd-4b74-953b-d48fc617b3d4	Esmalte sintético antioxidante	TKROM	FDS-6401	/objects/uploads/f3061788-38f9-410c-a2cd-c897f1a43200	\N	2025-11-10 11:02:12.111558
56c1387d-05f5-4d23-8bea-2ea14b386ca4	Cloruro de calcio	TETRA	CCTech	/objects/uploads/e5d96233-b677-44d0-85d8-39f4f8b53474	\N	2025-11-20 07:32:10.508621
581c19b1-68d5-4a79-81e8-659b37ce9cd8	FLOWEY B30 LIMPIADOR DE CARROCERÍAS	LIMPIADOR DE CARROCERÍAS	B30	/objects/uploads/4add7fc7-b555-4244-9d31-673a35742bd1	\N	2026-01-09 07:04:41.7221
\.


--
-- Data for Name: informes_aceptacion_maquinaria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.informes_aceptacion_maquinaria (id, trabajador_id, equipo_id, fecha_aceptacion, observaciones, fecha_creacion) FROM stdin;
000a9de1-6c06-48a5-b247-5f10a64fcfd2	05c8869b-6418-4a71-8da7-51583df6c2f5	fba1d158-53c4-442f-9094-ebce8923d493	2025-11-18	\N	2025-11-18 09:00:55.735625
acb39249-374a-4690-af19-3f75374863ae	b284ef85-031b-4f2a-a97a-c1d4ee160086	e9f8e903-99f6-4445-8821-f7215c6f165f	2025-11-18	\N	2025-11-18 10:23:05.814735
\.


--
-- Data for Name: mantenimientos_equipos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mantenimientos_equipos (id, equipo_id, fecha, actuacion_realizada, persona_realiza, observaciones, firma_url, fecha_creacion) FROM stdin;
ac19f0b4-919d-4329-8c55-c2518fcfe3c3	16086a56-4244-42d0-8111-2fff770f195b	2025-11-10	Cambio espadin	Cesar García Uceda	pieza original 	/objects/uploads/85915595-a106-491d-846d-5a63e52d9fed	2025-11-10 13:10:53.520508
af0ba966-1314-45ce-963a-a9701501afa3	82775268-67e2-4015-947c-663d6fad1db4	2025-11-06	Cambio de aceite. Aceite 10w40	Jose Luis García García	\N	/objects/uploads/7d4b59c4-eb88-4ddc-906d-0cc994a37422	2025-11-17 13:07:16.613355
\.


--
-- Data for Name: productos_quimicos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos_quimicos (id, zona_id, nombre, ubicacion_almacen, cantidad, nombre_comercial) FROM stdin;
43a5cf6b-f723-4b1f-9ad4-41ec3484f5ef	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	Aceite engrase cadena	Cochera	10 L.	SilverOil
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
5Vn720GnDP9dQ3kKiZEtsmLAWHL3JDEx	{"cookie":{"originalMaxAge":604800000,"expires":"2026-06-17T11:41:23.197Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"1dca714c-1b60-441b-acc1-b0c75c01abba","nombreUsuario":"djimenez@jccm.es","tipoAcceso":"Administrador","zonasIds":["07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51"]}	2026-06-17 11:41:27
wRCFC1KxwxAb7cFA3z3hr2NeG5TOaSww	{"cookie":{"originalMaxAge":604800000,"expires":"2026-06-17T05:16:16.690Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"929f4a0c-10e4-4eec-ab7c-d77850055511","nombreUsuario":"fzornoza@jccm.es","tipoAcceso":"Administrador","zonasIds":["07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51"]}	2026-06-17 05:16:44
\.


--
-- Data for Name: trabajadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trabajadores (id, nombre_completo, categoria, fecha_nacimiento, dni, email, zona_id, ficha_evaluacion_riesgos_url, fecha_incorporacion) FROM stdin;
b105ccce-bf46-491d-b580-a03114439ff3	Eusebio Salvador García	CONDUCTOR	1972-01-29	74507857R	esalvador@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/3757735f-38f9-47ea-a963-f6ca6f226df2	2019-06-27
abeb26b0-9077-475c-b010-43bc4dd831aa	David Jiménez Minaya	ENC. GRAL. O.P.	1979-12-10	47062993W	djimenez@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	\N	2013-01-01
78b07ef7-4245-4de2-9103-c20475247481	Sergio García Sánchez	PEON ESP.	1978-01-01	53140205Q	\N	912c1a5a-a8c5-4b73-b69d-33f3ffb16141	\N	\N
90e80a9a-82a1-4d5f-8439-6c004dbc1501	Miguel Ángel Martínez Ortega	ENCARGADO	1982-07-08	47072224X	miguelamartinez@jccm.es	912c1a5a-a8c5-4b73-b69d-33f3ffb16141	\N	\N
d13a02f2-25aa-4be5-8f9d-57ba74a8cd85	Francisco Zornoza Albiar	ENCARGADO	1963-08-06	04548254D	fzornoza@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/4f9d6aa2-35ff-446f-ad97-3e2b71079d5f	2025-09-04
05c8869b-6418-4a71-8da7-51583df6c2f5	Jose Luis García García	OPERADOR M.P.	1974-07-03	52758594K	jluisgg@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/bf3fa914-016d-4c91-97af-7a318daeef13	2020-12-07
b284ef85-031b-4f2a-a97a-c1d4ee160086	Carmelo Moreno Díaz	PEON ESP.	1969-12-04	07558657Y	cmorenodiaz@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/111fa130-ccce-4d54-b102-a568bff2305f	2022-09-05
7d5041af-0126-48b4-8a5a-fea24ac06fb0	Juan Carlos Martínez Sarrias	PEON ESP.	1966-01-25	05200682Z	jcmartinezsa@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/45affaf0-a27d-4a03-becb-ff8b86b1206d	2024-06-05
b74b1e7c-0b36-4e5f-a50f-986cc0a5c925	Nestor Tercero Pastor	CONDUCTOR	1984-10-20	47080970Q	ntercero@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/8e4d6135-f37e-437b-8129-619ca66db07c	2025-03-06
8d86c9ae-e4ab-460b-81a1-f2ae1b4421cb	Concepción Díaz Villada	PEON ESP.	1968-12-08	07545225Y	cdiazv@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/985c4662-a340-48b5-8266-03eb9dda5c02	2024-12-26
37d81fcb-baea-4f86-bfa1-49e547279e8d	Cesar García Uceda	PEON ESP.	1984-10-13	47082117J	cguceda@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	/objects/uploads/1ea2933f-1e7d-4f1e-9023-b7c00464b310	2025-03-10
08b6f03e-d1f8-43a3-9962-aeecb489b917	Juan Jesús Ródenas Roldán	PEON ESP.	1968-05-16	07551947N	jjrodenas@jccm.es	07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	\N	2025-12-19
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre_usuario, password, tipo_acceso, fecha_creacion, zonas_ids, email) FROM stdin;
be531363-8a22-403a-bbab-a437c0216e00	cesareov@jccm.es	$2b$10$w2VsLii9J8CBr8WzZVdCvepc2cRvCC0dMOaTnj9mHVH7bQWQuQJZe	Administrador	2025-10-20 06:36:32.264138	{e129d238-3dee-42cc-9ad8-ebd92d045020,114881c7-549c-4d55-ad23-9883a0c81809}	\N
2a3f5727-1dc1-4fc8-be7d-47cb1e45b9fd	vmartineze@jccm.es	$2b$10$A6.4IN650xtrhOUZaCGCUOlry7G3tqOob3P74.hCrxA3wU3VIlIcW	Administrador	2025-10-20 06:37:38.606022	{912c1a5a-a8c5-4b73-b69d-33f3ffb16141,760b0989-15e2-4249-8e8e-b2ea2f8d8605}	\N
e26b8ef8-dd95-4d0f-82d1-5f0534ac2dee	jluisgg@jccm.es	$2b$10$Ur2f.YIWd7kfZmnJiNVfYORikf1enGH5vsQMVaFNJddHvDA1nT3mC	Usuario	2025-10-23 11:20:15.304719	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
2dc1b589-44a1-4f0e-a512-88af35a13fca	jcmartinezsa@jccm.es	$2b$10$kLh676hZyPMz8SxGFxrSgulgcnKIaJ/L2yeYjVP2QCGzy4yobuL1S	Usuario	2025-10-23 11:23:15.369742	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
1f82e313-c6fb-4f6b-81f5-121b255a8f95	cmorenodiaz@jccm.es	$2b$10$5VxbwDl.kpUObBnhxEtpqu2Dg2UvXU.ooka.GW63iNvfB26DYvmWu	Usuario	2025-10-23 11:24:17.557882	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
659b713a-3571-40d0-a6bc-206791cd9ad7	esalvador@jccm.es	$2b$10$foij58S/H55evRZcNeqI7O0vSxYsU4Hk4HTlZozER4CJIJRZrbVW2	Usuario	2025-10-23 11:24:39.818852	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
75ec3ba2-f645-4cd1-929f-4ca13e2cb725	ntercero@jccm.es	$2b$10$.MY7MHQAdxUdFdyb0OyOzOp2pWYIh6Y1cRzlsve6mrCiKRVkaS4X.	Usuario	2025-10-23 11:25:07.835797	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
573fdf7c-60ce-4989-ac64-7a301504b5ed	cdiazv@jccm.es	$2b$10$9phNkWDoqT/PXuRyQzEr4eil2VPIyRy3.hRAQTsuiaWtBC/oNNO.2	Usuario	2025-10-23 11:25:41.829824	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
6c0a0386-b443-4096-a46d-129d67740b14	miguelamartinez@jccm.es	$2b$10$YKOQWNVHqAdwayB/X204oe9Zeu8UC85VftX2mSE3pXXC036usMPt2	Administrador	2025-10-23 11:50:52.460975	{912c1a5a-a8c5-4b73-b69d-33f3ffb16141}	\N
3dcd2473-aed8-4d68-9507-4ef32b6d6d4c	pavillora@jccm.es	$2b$10$AUg/WlJ4h7MRwvYm//PIE.IPgB2llSTsnlYGaOWISTUTofR3x7S7y	Administrador	2025-11-05 10:08:42.497214	{e129d238-3dee-42cc-9ad8-ebd92d045020,114881c7-549c-4d55-ad23-9883a0c81809,07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51,912c1a5a-a8c5-4b73-b69d-33f3ffb16141,760b0989-15e2-4249-8e8e-b2ea2f8d8605}	\N
e590e98f-e2b8-4180-8c80-089e18ff6482	cguceda@jccm.es	$2b$10$XjdVfe2gcM4qNiRXfosKveq/BVuV6x.YEAch7LOXytbdt1nJ58T9K	Usuario	2025-10-23 11:23:41.961477	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
929f4a0c-10e4-4eec-ab7c-d77850055511	fzornoza@jccm.es	$2b$10$iJgvVn.DnHABIxSzYCYadeb9X9usIg45MoS4UUxl8mCVPRILdlxnC	Administrador	2025-10-21 09:48:25.818938	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
78900ab1-07c1-4f40-8be4-052a78ebe7b4	jjrodenas@jccm.es	$2b$10$D3Rt.ArbsDI9x7LQvxHZSuYJkB2XNgDFXDYqaj1C5.QmVVkpbFG3S	Usuario	2026-06-09 07:27:53.674798	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
1dca714c-1b60-441b-acc1-b0c75c01abba	djimenez@jccm.es	$2b$10$7/QQsfnBytMDcBRujjKch.34zRxsPEUF1zPz7yMTfb1jTI24XwOAm	Administrador	2025-10-18 07:04:54.206089	{07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51}	\N
90db08d4-3a70-4619-b111-306aba9c17d0	djimenezad@jccm.es	$2b$10$/BA0fRlbqWTukZwtnfzZgOxC6D/6awRQB7GJUVZjbcTivOzEb3D1O	AdminGral	2025-10-17 17:04:02.637119	{aa09dcc4-e9d2-4c41-b007-b938d35eb6d6}	djimenezad@jccm.es
\.


--
-- Data for Name: zonas_trabajo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zonas_trabajo (id, zona, fecha_creacion) FROM stdin;
07f2f2a3-f353-4fb7-b0e0-d13c7ee89a51	Zona 2.2 Almansa	2025-10-18 07:06:49.568492
e129d238-3dee-42cc-9ad8-ebd92d045020	Zona 1.1 Alcaraz	2025-10-20 06:31:21.145916
114881c7-549c-4d55-ad23-9883a0c81809	Zona 1.2 Munera	2025-10-20 06:31:40.649229
912c1a5a-a8c5-4b73-b69d-33f3ffb16141	Zona 3.1 Albacete Sur	2025-10-20 06:32:10.688274
760b0989-15e2-4249-8e8e-b2ea2f8d8605	Zona 3.2 Elche de la Sierra	2025-10-20 06:32:41.350077
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: -
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 9, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


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
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: -
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


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

\unrestrict 9Q3qyQafhZi0LUftc2f4VFiCx7dZdhgp0OGhpzRsg6NP0y5IpJHN0X2l7amhzTi

