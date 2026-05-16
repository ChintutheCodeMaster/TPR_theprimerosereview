-- Allow admins to update any school row (e.g. setting logo_url from SuperAdmin)
CREATE POLICY "Admins update any school"
  ON public.schools FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to upload to school-logos storage bucket
CREATE POLICY "Admins upload school logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-logos' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins update school logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'school-logos' AND
    public.has_role(auth.uid(), 'admin')
  );
