// List of albums with metadata including artist name, album cover, and song list
export const albums = [
  {
    id: "1",
    name: "Best of Sheeran",
    artist: "Ed Sheeran",
    image: "https://i.pinimg.com/originals/88/3b/2c/883b2c50f85db0b3af2ab8bbc610e4e4.jpg",
    cover: "https://people.com/thmb/pLCPhXSSCKtpesgNZHfXN8MIISc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(749x0:751x2)/Ed-sheeran-autumn-variations-artwork-cover-082423pg-9a117ec25b2a4778a2658855e5b59b28.jpg",
    aboutCover: "https://images-fe.ssl-images-amazon.com/images/S/pv-target-images/49b7de2367c880439acd0cdfd75b019f3d32e72e74324f2312a4cc3bdc3165bb._RI_TTW_SX1080_FMpng_.png",

    // Each album contains a list of songs with details like title, artist, and audio path
    songs: [
      { id: "1", title: "Shape of You", artist: "Ed Sheeran", audio: "/assets/musics/Shape of You - Ed Sheeran.mp3", image: "/assets/musics/album_cover/Cover of Shape of You by Ed Sheeran.jpg", dateAdded: "Dec 10,2021" },
      { id: "2", title: "Perfect", artist: "Ed Sheeran", audio: "/assets/musics/Perfect - Ed Sheeran.mp3", image: "/assets/musics/album_cover/Cover of Shape of You by Ed Sheeran.jpg", dateAdded: "Dec 10,2021" },
    ],
  },
  // {
  //   id: "2",
  //   name: "Blinding Lights",
  //   artist: "The Weeknd",
  //   image: "/assets/music-cover/blinding-lights.jpg",
  //   songs: [
  //     { id: "1", title: "Blinding Lights", artist: "Ed Sheeran", audio: "/assets/music/blinding-lights.mp3" },
  //     { id: "2", title: "Save Your Tears", artist: "Ed Sheeran", audio: "/assets/music/save-your-tears.mp3" },
  //   ],
  // },
];

// Top picks section, featuring standalone songs with title, artist, and image
export const topPicks = [
  {
    id: "1",
    title: "My Time is Now",
    artist: "John Cena",
    image: "https://th.bing.com/th/id/OIP.nf38N0RFoOcRl84-mEO5WAHaEo?rs=1&pid=ImgDetMain",
    audio: "assets/musics/WWE_ The Time Is Now (John Cena).mp3"
  },
  // {
  //   id: "2",
  //   title: "Lose Yourself",
  //   artist: "Eminem",
  //   image: "https://th.bing.com/th/id/OIP.3LZ8mNoxL8_8lAjeB58JeQHaHa?rs=1&pid=ImgDetMain",
  // },
  // {
  //   id: "3",
  //   title: "God’s Plan",
  //   artist: "Drake",
  //   image: "https://th.bing.com/th/id/OIP.nZOvZW9SEjx2FzN1JXYj7AHaHa?rs=1&pid=ImgDetMain",
  // },
  // {
  //   id: "4",
  //   title: "Rolling in the Deep",
  //   artist: "Adele",
  //   image: "https://th.bing.com/th/id/OIP.Zv7bcmH3X9KdrU2D6YZBGQHaHa?rs=1&pid=ImgDetMain",
  // },
];
