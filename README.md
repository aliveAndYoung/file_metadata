this is a simple file metadata microservice built with node.js and it built-in fs and http module to start the server and serve a static html page 

upload any file  --> spits back the file name, type, and size (bytes) in json

it is really a simple app with not that much of features never the less it helped me get more familliar
with how http request look like and how form content are being sent in chunks and assembled back on the server
i made sure to implement the form-data parsing part and extracting the needed metadat out of it manually and that made me 
appreciate what does smth like multer do and the way it abstract all that 

i added a html file with a form element and basic styling and a script tag just for the sack of testing

example response in json 
```json
{
  "name": "cool-cat.jpg",
  "type": "image/jpeg",
  "size": 42069
}
