-- Create storage bucket for explanation images
INSERT INTO storage.buckets (id, name, public) VALUES ('explanation-images', 'explanation-images', true);

-- Storage policies for explanation images
CREATE POLICY "Anyone can view explanation images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'explanation-images');

CREATE POLICY "Authenticated users can upload explanation images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'explanation-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their explanation images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'explanation-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete explanation images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'explanation-images' AND auth.role() = 'authenticated');