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
    title: "Masakali",
    artist: "Mohit Chauhan",
    image: "assets/musics/album_cover/Cover of Masakali by Mohit Chauhan, A.R. Rahman, Prasoon Joshi.jpg",
    audio: "assets/musics/Masakali - Mohit Chauhan.mp3"
  },
  {
    id: "2",
    title: "We Don't Talk Anymore (feat. Selena Gomez)",
    artist: "Charlie Puth, Selena Gomez",
    image: "assets/musics/album_cover/Cover of We Don't Talk Anymore (feat. Selena Gomez) by Charlie Puth, Selena Gomez.jpg",
    audio: "assets/musics/We Don't Talk Anymore (feat. Selena Gomez) - Charlie Puth.mp3"
  },
  {
    id: "3",
    title: "Where Are Now (with Justin Bieber)",
    artist: "Jack Ü, Skrillex, Diplo, Justin Bieber",
    image: "assets/musics/album_cover/Cover of Where Are Ü Now (with Justin Bieber) by Jack Ü, Skrillex, Diplo, Justin Bieber.jpg",
    audio: "assets/musics/Where Are Ü Now (with Justin Bieber) - Jack Ü.mp3"
  },
  {
    id: "4",
    title: "On My Way",
    artist: "Alan Walker",
    image: "assets/musics/album_cover/Cover of On My Way by Alan Walker, Sabrina Carpenter, Farruko.jpg",
    audio: "assets/musics/On My Way - Alan Walker.mp3"
  },
  {
    id: "5",
    title: "What Makes You Beautiful",
    artist: "One Direction",
    image: "assets/musics/album_cover/Cover of What Makes You Beautiful by One Direction.jpg",
    audio: "assets/musics/What Makes You Beautiful - One Direction.mp3"
  },
  {
    id: "6",
    title: "Stressed Out",
    artist: "Twenty One Pilots",
    image: "assets/musics/album_cover/Cover of Stressed Out by Twenty One Pilots.jpg",
    audio: "assets/musics/Stressed Out - Twenty One Pilots.mp3"
  },
  {
    id: "7",
    title: "Habitual",
    artist: "Justin Bieber",
    image: "assets/musics/album_cover/Cover of Habitual by Justin Bieber.jpg",
    audio: "assets/musics/Habitual - Justin Bieber.mp3"
  },
  
];
