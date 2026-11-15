import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPhoto, PhotoCategory } from '../../types';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Video, 
  Play, 
  Film,
  Camera, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Tag,
  FolderDown,
  Download
} from 'lucide-react';
import { 
  getPhotosForJob, 
  saveJobPhotos, 
  deleteJobPhoto, 
  updatePhoto, 
  readFileAsDataURL 
} from '../../lib/photoStorage';

const PHOTO_CATEGORIES: PhotoCategory[] = [
  'Tutte',
  'Foto',
  'Video & Reel',
  'Copertina',
  'Soggiorno',
  'Cucina',
  'Camera',
  'Bagno',
  'Esterni',
  'Terrazzo / Vista',
  'Drone',
  'Dettagli',
  'Altro'
];

export const PhotoGalleryModal: React.FC = () => {
  const { photoGalleryJob, setPhotoGalleryJob, updateJob } = useApp();
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('Tutte');
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Link Video Modal
  const [isVideoLinkModalOpen, setIsVideoLinkModalOpen] = useState(false);
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [videoLinkTitle, setVideoLinkTitle] = useState('');
  const [videoLinkCategory, setVideoLinkCategory] = useState<PhotoCategory>('Video & Reel');

  useEffect(() => {
    if (photoGalleryJob) {
      loadPhotos(photoGalleryJob.id);
    } else {
      setPhotos([]);
      setLightboxIndex(null);
    }
  }, [photoGalleryJob]);

  const loadPhotos = async (jobId: string) => {
    try {
      const list = await getPhotosForJob(jobId);
      setPhotos(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Errore caricamento foto/video:', e);
      setPhotos([]);
    }
  };

  // Filtra foto e video per categoria (dichiarato prima di qualsiasi early return)
  const filteredPhotos = useMemo(() => {
    const valid = (photos || []).filter(p => !!p && !!p.id);
    if (selectedCategory === 'Tutte') return valid;
    if (selectedCategory === 'Foto') return valid.filter(p => p.mediaType !== 'video');
    if (selectedCategory === 'Video & Reel') return valid.filter(p => p.mediaType === 'video' || p.category === 'Video & Reel');
    return valid.filter(p => p.category === selectedCategory);
  }, [photos, selectedCategory]);

  const photoCount = (photos || []).filter(p => p && p.mediaType !== 'video').length;
  const videoCount = (photos || []).filter(p => p && (p.mediaType === 'video' || p.category === 'Video & Reel')).length;

  if (!photoGalleryJob) return null;

  // Gestione caricamento file multipli (Foto e Video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: { 
      name: string; 
      size: number; 
      type: string; 
      dataUrl: string; 
      mediaType?: 'photo' | 'video'; 
      category?: PhotoCategory 
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const isVideoFile = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
        
        // Se è un video molto grande (> 80MB) usa un URL blob locale o avvisa
        let dataUrl: string;
        if (isVideoFile && file.size > 80 * 1024 * 1024) {
          dataUrl = URL.createObjectURL(file);
        } else {
          dataUrl = await readFileAsDataURL(file);
        }

        newItems.push({
          name: file.name,
          size: file.size,
          type: file.type || (isVideoFile ? 'video/mp4' : 'image/jpeg'),
          mediaType: isVideoFile ? 'video' : 'photo',
          dataUrl,
          category: isVideoFile 
            ? 'Video & Reel' 
            : (selectedCategory !== 'Tutte' && selectedCategory !== 'Foto' && selectedCategory !== 'Video & Reel' ? selectedCategory : 'Soggiorno')
        });
      } catch (err) {
        console.error('Errore lettura file:', err);
      }
    }

    if (newItems.length > 0) {
      const saved = await saveJobPhotos(photoGalleryJob.id, newItems);
      setPhotos(prev => [...prev, ...saved]);

      // Se il lavoro non ha ancora una copertina, imposta la prima foto caricata
      const firstPhoto = saved.find(s => s.mediaType !== 'video');
      if (!photoGalleryJob.coverPhotoUrl && firstPhoto) {
        updateJob(photoGalleryJob.id, { coverPhotoUrl: firstPhoto.dataUrl });
      }
    }

    setIsUploading(false);
    e.target.value = '';
  };

  // Aggiunge link video esterno (Drive, YouTube, Dropbox)
  const handleAddVideoLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoLinkUrl.trim()) return;

    const newVideoItem = {
      name: videoLinkTitle.trim() || 'Video Tour Immobile',
      size: 0,
      type: 'video/mp4',
      mediaType: 'video' as const,
      category: videoLinkCategory,
      dataUrl: videoLinkUrl.trim(),
      videoUrl: videoLinkUrl.trim(),
      duration: 'HD'
    };

    const saved = await saveJobPhotos(photoGalleryJob.id, [newVideoItem]);
    setPhotos(prev => [...prev, ...saved]);

    // Aggiorna anche il link cloud folder del lavoro se vuoto
    if (!photoGalleryJob.cloudFolderUrl) {
      updateJob(photoGalleryJob.id, { cloudFolderUrl: videoLinkUrl.trim() });
    }

    setVideoLinkUrl('');
    setVideoLinkTitle('');
    setIsVideoLinkModalOpen(false);
  };

  // Imposta come foto di copertina
  const handleSetCover = async (photo: JobPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    for (const p of photos) {
      if (p.isCover && p.id !== photo.id) {
        await updatePhoto(p.id, { isCover: false });
      }
    }
    await updatePhoto(photo.id, { isCover: true });
    updateJob(photoGalleryJob.id, { coverPhotoUrl: photo.dataUrl });
    setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === photo.id })));
  };

  // Elimina elemento
  const handleDeletePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Eliminare questo elemento multimediale?')) {
      await deleteJobPhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (lightboxIndex !== null) setLightboxIndex(null);
    }
  };

  // Cambia categoria
  const handleChangeCategory = async (photoId: string, cat: PhotoCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    await updatePhoto(photoId, { category: cat });
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, category: cat } : p));
  };

  const activeMedia = lightboxIndex !== null && filteredPhotos[lightboxIndex] ? filteredPhotos[lightboxIndex] : null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      onClick={() => setPhotoGalleryJob(null)}
    >
      <div 
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Galleria Foto & Video: {photoGalleryJob.propertyAddress}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {photoGalleryJob.clientName} {photoGalleryJob.agency ? `(${photoGalleryJob.agency})` : ''} • <strong className="text-slate-700 dark:text-slate-300">{photoCount}</strong> foto caricate ({photoGalleryJob.expectedPhotos} previste) • <strong className="text-blue-600 dark:text-blue-400">{videoCount}</strong> video ({photoGalleryJob.expectedVideos || 0} previsti)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Pulsante Aggiungi Link Video */}
            <button
              onClick={() => setIsVideoLinkModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title="Aggiungi link video da Google Drive, YouTube o Dropbox"
            >
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Link Video</span>
            </button>

            {/* Upload Button per Foto e File Video */}
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Caricamento...' : 'Carica File'}</span>
              <input 
                type="file" 
                multiple 
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="hidden" 
              />
            </label>

            {/* Chiudi Modal */}
            <button 
              onClick={() => setPhotoGalleryJob(null)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra Filtri Categorie Foto e Video */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 bg-white dark:bg-slate-900 scrollbar-none">
          <Tag className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {PHOTO_CATEGORIES.map(cat => {
            let count = 0;
            if (cat === 'Tutte') count = photos.length;
            else if (cat === 'Foto') count = photoCount;
            else if (cat === 'Video & Reel') count = videoCount;
            else count = photos.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat === 'Video & Reel' && <Video className="w-3 h-3 text-red-400" />}
                {cat === 'Foto' && <Camera className="w-3 h-3 text-sky-400" />}
                <span>{cat}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sezione Link Cartella Cloud se presente */}
        {photoGalleryJob.cloudFolderUrl && (
          <div className="px-6 py-2 bg-blue-50/60 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <FolderDown className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold">Cartella Cloud del Lavoro:</span>
              <a 
                href={photoGalleryJob.cloudFolderUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline truncate hover:text-blue-800"
              >
                {photoGalleryJob.cloudFolderUrl}
              </a>
            </div>
            <a 
              href={photoGalleryJob.cloudFolderUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[11px]"
            >
              <span>Apri Cartella</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[320px]">
          {filteredPhotos.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <Video className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Nessun file presente in questa sezione
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Trascina qui le fotografie e i video dell'immobile, oppure usa i pulsanti in alto per caricare scatti o collegare video.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsVideoLinkModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  + Inserisci Link Video (Drive/YouTube)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((item, index) => {
                const isVideo = item.mediaType === 'video' || item.category === 'Video & Reel' || item.type.startsWith('video/');

                return (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-subtle hover:shadow-premium transition-all border border-slate-200/80 dark:border-slate-800 flex items-center justify-center"
                  >
                    {isVideo ? (
                      item.dataUrl.startsWith('http') && !item.dataUrl.includes('drive.google') && !item.dataUrl.includes('dropbox') ? (
                        <video
                          src={item.dataUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-3 text-center">
                          <Film className="w-10 h-10 text-blue-400 mb-1" />
                          <p className="text-xs font-bold text-white truncate max-w-full px-2">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-blue-300 mt-1">Video Tour</span>
                        </div>
                      )
                    ) : (
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between" />

                    {/* Play icon overlay on video */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Top Badges: Cover & Category */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 max-w-[80%]">
                      {item.isCover && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 fill-current" /> Copertina
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md truncate ${
                        isVideo ? 'bg-red-600/90 text-white' : 'bg-slate-900/80 text-white'
                      }`}>
                        {isVideo ? 'VIDEO' : item.category}
                      </span>
                    </div>

                    {/* Duration badge for video */}
                    {isVideo && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                          {item.duration || 'Video'}
                        </span>
                      </div>
                    )}

                    {/* Hover Action Buttons */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {!isVideo && (
                        <button
                          onClick={(e) => handleSetCover(item, e)}
                          title="Imposta come copertina immobile"
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                            item.isCover 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-black/60 hover:bg-amber-500 text-white'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeletePhoto(item.id, e)}
                        title="Elimina"
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LIGHTBOX / FULLSCREEN MEDIA VIEWER */}
        {activeMedia && (
          <div 
            className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-between p-4 animate-in fade-in duration-150"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white px-2 py-2" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold truncate max-w-sm">
                  {activeMedia.name}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeMedia.mediaType === 'video' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {activeMedia.mediaType === 'video' ? 'VIDEO IMMOBILE' : activeMedia.category}
                </span>
                {activeMedia.isCover && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Copertina
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeMedia.mediaType !== 'video' && (
                  <button
                    onClick={(e) => handleSetCover(activeMedia, e)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Imposta Copertina</span>
                  </button>
                )}
                {activeMedia.videoUrl && (
                  <a
                    href={activeMedia.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Apri Fonte Video</span>
                  </a>
                )}
                <button
                  onClick={(e) => handleDeletePhoto(activeMedia.id, e)}
                  className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title="Chiudi visualizzatore"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Central Media Viewer with Prev / Next */}
            <div className="relative flex-1 flex items-center justify-center max-w-6xl w-full my-auto" onClick={e => e.stopPropagation()}>
              {filteredPhotos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((lightboxIndex! - 1 + filteredPhotos.length) % filteredPhotos.length)}
                  className="absolute left-2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {activeMedia.mediaType === 'video' || activeMedia.type.startsWith('video/') ? (
                <div className="w-full max-w-4xl max-h-[75vh] flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl">
                  {activeMedia.dataUrl.startsWith('http') && (activeMedia.dataUrl.includes('drive.google') || activeMedia.dataUrl.includes('dropbox')) ? (
                    <div className="p-12 text-center text-white">
                      <Film className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h4 className="text-base font-bold mb-2">Video Tour Ospitato su Cloud</h4>
                      <p className="text-xs text-slate-300 mb-4 max-w-md mx-auto">
                        Questo video è memorizzato sul tuo Google Drive / Dropbox collegato. Clicca in basso per riprodurlo.
                      </p>
                      <a
                        href={activeMedia.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Apri e Guarda Video su Cloud</span>
                      </a>
                    </div>
                  ) : (
                    <video
                      src={activeMedia.dataUrl}
                      controls
                      autoPlay
                      className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={activeMedia.dataUrl}
                  alt={activeMedia.name}
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              )}

              {filteredPhotos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((lightboxIndex! + 1) % filteredPhotos.length)}
                  className="absolute right-2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Category Selector for active photo */}
            {activeMedia.mediaType !== 'video' && (
              <div className="flex items-center gap-2 overflow-x-auto py-2 text-white text-xs" onClick={e => e.stopPropagation()}>
                <span className="text-slate-400 mr-2">Ambiente:</span>
                {PHOTO_CATEGORIES.filter(c => c !== 'Tutte' && c !== 'Foto' && c !== 'Video & Reel').map(cat => (
                  <button
                    key={cat}
                    onClick={(e) => handleChangeCategory(activeMedia.id, cat, e)}
                    className={`px-3 py-1 rounded-xl font-semibold transition-colors ${
                      activeMedia.category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL AGGIUNGI LINK VIDEO */}
        {isVideoLinkModalOpen && (
          <div 
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100"
            onClick={() => setIsVideoLinkModalOpen(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span>Aggiungi Video Tour Immobile</span>
                </h3>
                <button 
                  onClick={() => setIsVideoLinkModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVideoLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Titolo del Video
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Video Reel Instagram o Tour Orizzontale 4K"
                    value={videoLinkTitle}
                    onChange={e => setVideoLinkTitle(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Video (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... o YouTube / Vimeo / Dropbox"
                    value={videoLinkUrl}
                    onChange={e => setVideoLinkUrl(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipologia Video
                  </label>
                  <select
                    value={videoLinkCategory}
                    onChange={e => setVideoLinkCategory(e.target.value as PhotoCategory)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Video & Reel">Video & Reel (Verticale / Orizzontale)</option>
                    <option value="Drone">Riprese Drone Aeree</option>
                    <option value="Terrazzo / Vista">Vista & Dettagli</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVideoLinkModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                  >
                    Salva Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
