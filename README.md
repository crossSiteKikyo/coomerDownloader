downloader for coomer.su and kemono.su

## prerequisite
nodejs

## Installation
```bash
git clone https://github.com/crossSiteKikyo/coomerDownloader.git
cd coomerDownloader
npm install 
```

## Command
```bash
node down -url URL [-limit LIMIT] [-start STARTINDEX]
```

- -url is mandatory. you have to specify user url. not post url.
- -limit is option. default value is 50
- -start is option. default value is 0

This repository use selenium. The first time you run it, you'll probably have to solve captcha. 

## directory structure
```
coomerDownloader/
|
└─data/
   ├─ nickname1/
   |   ├─ postId1/
   |   |   ├─ info.txt
   |   |   ├─ content.txt
   |   |   └─ ...
   |   └─ postId2/
   |       ├─ info.txt
   |       ├─ content.txt
   |       └─ ...
   └─ nickname2/
       ├─ postId1/
       |   ├─ info.txt
       |   ├─ content.txt
       |   └─ ...
       └─ postId2/
           ├─ info.txt
           ├─ content.txt
           └─ ...
```
