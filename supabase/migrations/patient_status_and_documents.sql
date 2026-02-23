-- ============================================
-- 1. Add "ativo" column to patients table
-- ============================================
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- ============================================
-- 2. Create patient_documents table
-- ============================================
CREATE TABLE IF NOT EXISTS patient_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  doctor_id uuid REFERENCES doctors(id) NOT NULL,
  titulo text NOT NULL,
  descricao text,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients can view own documents"
  ON patient_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_documents.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Doctors can view all documents
CREATE POLICY "Doctors can view all documents"
  ON patient_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can insert documents
CREATE POLICY "Doctors can insert documents"
  ON patient_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can delete documents
CREATE POLICY "Doctors can delete documents"
  ON patient_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. Create storage bucket for patient documents
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents',
  'patient-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Storage policies for patient-documents bucket
CREATE POLICY "Doctors can upload patient documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND EXISTS (
      SELECT 1 FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view patient documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Doctors can delete patient documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-documents'
    AND EXISTS (
      SELECT 1 FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );
