export interface IWorkGallery {
  title: string;
  coverImage: string;
  Images: string[];
  description: string;
}

export function initWorkGallery(): IWorkGallery {
  return {
    title: '',
    coverImage: '',
    Images: [],
    description: '',
  };
}
