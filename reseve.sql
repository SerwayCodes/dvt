-- Table: public.patients

-- DROP TABLE IF EXISTS public.patients;

CREATE TABLE IF NOT EXISTS public.reviews
(
   id serial PRIMARY KEY;
    patientid int,
    dateofreview date,
    generalcondition character varying(50),
    treatmentplan text,
    observations text,
    followuprecommendations text,
    timeofreview time,
    FOREIGN KEY(patientid) REFERENCES patients(patientid);
)

