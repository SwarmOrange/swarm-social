All user data stored in directory
```
/social
```
First file is profile.json. This file contains basic information about the user
```
/social/profile.json
```
The contents of this file:

first_name - user's first name

last_name - user's last name

birth_date - user's birth date

location - object which contains 'coordinates' object with latitude and longitude. Also object has property 'name' with the name of user's place name

photo - object with user's avatar photo info. 'original' - path to avatar without compression

about - short info about user

i_follow - array of users which current user follow

last_post_id - last ID of post

last_photoalbum_id - last ID of photoalbum

last_videoalbum_id - last ID of photoalbum

ethereum_wallet - user's Ethereum wallet

version - version of the project that updated this file

```
{  
   "first_name":"SWARM",
   "last_name":"User",
   "birth_date":"24/07/2018",
   "location":{  
      "coordinates":{  
            "lat":"53.905581",
            "long":"27.571085",
      },
      "name":"Belarus, Minsk"
   },
   "photo":{  
      "original":"social/file/avatar/original.jpg"
   },
   "about":"My SWARM page. You can edit this information",
   "i_follow":[  
        "4f90aa157a33120aeee2db73f3f924243a2414f576c618119bd7d47d465dd4be",
        "51493f7b4d322550bcb1a92c6ff1d3a5b98cf8e07c7515f9bdf13ea9a30c8267"
   ],
   "last_post_id":3,
   "last_photoalbum_id":5,
   "last_videoalbum_id":2,
   "ethereum_wallet":"0xFb08943D0a9F69A1c998C54046c7C5A851405782",
   "version":1
}
```

For each content type there are separate directories

```
/social/file/
/social/photoalbum/
/social/videoalbum/
/social/message/
```
Information about all photoalbums is stored in the /social/photoalbum/
```
/social/photoalbum/info.json
/social/photoalbum/1/info.json
/social/photoalbum/1/1.jpg
...
```

File /social/photoalbum/info.json contain short array info about all albums

id - ID of album

name - name or title of album

description - expanded info about album

cover_file - album's cover

```
[
   {
      "id":3,
      "name":"Uploaded",
      "description":"",
      "cover_file":"social/photoalbum/3/1.jpg"
   },
   {
      "id":4,
      "name":"Uploaded",
      "description":"",
      "cover_file":"social/photoalbum/4/1.jpg"
   },
   {
      "id":5,
      "name":"Uploaded",
      "description":"",
      "cover_file":"social/photoalbum/5/1.jpg"
   }
]
```

First photoalbum info and content stored in /social/photoalbum/1/. Full info about album stored in /social/photoalbum/1/info.json.
Difference between short info in 'social/photoalbum/info.json' and full info in 'social/photoalbum/1/info.json' is that the latter contains information about all photos in 'photos' array.

```
{
   "id":5,
   "name":"Uploaded",
   "description":"",
   "cover_file":{
        "file":"social/photoalbum/5/1.jpg",
        "previews":{"250x250":"social/photoalbum/5/1_250x250.jpg"}
   },
   "photos":[
      {
         "file":"social/photoalbum/5/1.jpg",
         "description":"",
         "previews":{"250x250":"social/photoalbum/5/1_250x250.jpg"}
      },
      {
         "file":"social/photoalbum/5/2.jpg",
         "description":"",
         "previews":{"250x250":"social/photoalbum/5/2_250x250.jpg"}
      },
      {
         "file":"social/photoalbum/5/3.jpg",
         "description":"",
         "previews":{"250x250":"social/photoalbum/5/3_250x250.jpg"}
      },
      {
         "file":"social/photoalbum/5/4.jpg",
         "description":"",
         "previews":{"250x250":"social/photoalbum/5/4_250x250.jpg"}
      }
   ]
}
```

Videoalbums similar photoalbums except that the video album stores information about the type of file in 'type' field. For uploaded file it will 'video', for attached youtube video it will 'youtube'.

```
/social/videoalbum/info.json
/social/videoalbum/6/info.json
/social/videoalbum/6/1.mp4
/social/videoalbum/6/2.mp4
```

```
[
   {
      "id":5,
      "type":"video",
      "name":"Uploaded",
      "description":"",
      "cover_file":"img/video-cover.jpg"
   },
   {
      "id":6,
      "type":"video",
      "name":"Uploaded",
      "description":"",
      "cover_file":"img/video-cover.jpg"
   }
]
```

```
{
   "id":6,
   "type":"video",
   "name":"Uploaded",
   "description":"",
   "cover_file":"img/video-cover.jpg",
   "videos":[
      {
         "id":1,
         "name":"",
         "description":"",
         "cover_file":"img/video-cover.jpg",
         "file":"social/videoalbum/6/1.mp4",
         "type":"video"
      },
      {
         "id":2,
         "name":"",
         "description":"",
         "cover_file":"img/video-cover.jpg",
         "file":"social/videoalbum/6/2.mp4",
         "type":"video"
      }
   ]
}
```

The 'message' folder contains information about sent messages. 'public' directory store info about not encrypted messages.
hash '714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626' in this path '/social/message/public/714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626/1.json' is receiver SWARM hash. Receiver could read this directory and see all messages for him.
'info.json' contain info about all recipients and last messages IDs.

```
/social/message/public/
/social/message/public/info.json
/social/message/public/714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626/1.json
/social/message/public/714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626/2.json

```
info.json
```
{
   "e191c70708a95ab2a32b121612da7475a54f58cced1a64753f90a0164dcccde3":{
      "last_message_id":5
   },
   "714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626":{
      "last_message_id":2
   }
}
```
Message in /social/message/public/714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626/1.json

after_receiver_message - is new message comes after receiver's message
after_message_id - after which message is our message
```
{
   "id":1,
   "timestamp": 1539095533,
   "after_receiver_message": true,
   "after_message_id": 3,
   "receiver_hash":"714364b9f179e51583798c5ad736965817e042d91ab243e2960fcde0076fb626",
   "message":"Hello. How are you?"
}
```
Info about posts. 'info.json' contain info about post text and attachments. All attachments stored in post directory with post identificator.
```
/social/post/4/info.json
/social/post/4/file/1536065858565.jpg
/social/post/4/file/1536065858565.mp4
```

```
{
   "id":4,
   "description":"My new post. A lot of text here",
   "attachments":[
      {
         "type":"photo",
         "url":"social/post/4/file/1536065858565.jpg",
         "previews":{
            "250x250":"social/post/4/file/1536065858565_250x250.jpg"
         }
      },
      {
         "type":"video",
         "url":"social/post/4/file/1536065858566.mp4"
      },
      {
         "type":"youtube",
         "url":"https://www.youtube.com/watch?v=dCwNaE_eVsM"
      }
   ]
}
```