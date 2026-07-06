// Shared helpers for translating between Supabase public URLs and storage
// object paths, and for building the deterministic paths used by
// NotesManager / PYQManager / SyllabusManager so the Requests approval flow
// stays perfectly in sync with how those managers name files.

// Turns a Supabase public URL into a storage object path for a given bucket.
// Returns null if the URL doesn't belong to that bucket (e.g. an external link).
export const parseStoragePath = (publicUrl, bucket) => {
  if (!publicUrl) return null;
  try {
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
};

export const getNotesPath = (paperId, moduleNumber, priority) =>
  `${paperId}/${paperId}_m${moduleNumber}_p${priority}.pdf`;

export const getPyqPath = (paperId, year, category, internalNumber) => {
  const safeCategory = category.replace(/[^a-zA-Z0-9]/g, '');
  const fileName = category === 'internal'
    ? `${paperId}_${year}_${safeCategory}_${internalNumber}.pdf`
    : `${paperId}_${year}_${safeCategory}.pdf`;
  return `${paperId}/${year}/${fileName}`;
};

export const getSyllabusPath = (paperId) => `syllabus/${paperId}.pdf`;

// Downloads a file from one bucket/path and re-uploads it to another
// bucket/path, returning the new public URL. Does NOT delete the source —
// callers should only delete the source after the DB write succeeds.
export const migrateStorageFile = async (supabase, { sourceBucket, sourcePath, targetBucket, targetPath }) => {
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(sourceBucket)
    .download(sourcePath);
  if (downloadError) throw new Error(`Could not read source file: ${downloadError.message}`);

  const { error: uploadError } = await supabase.storage
    .from(targetBucket)
    .upload(targetPath, fileBlob, { upsert: true, contentType: 'application/pdf' });
  if (uploadError) throw new Error(`Could not save file to ${targetBucket}: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from(targetBucket).getPublicUrl(targetPath);
  return publicUrl;
};