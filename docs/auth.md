# AuthController

### Register

*Parameters*

- email -> string 
- firstname -> string 
- lastname -> string
- password -> string
- enterprise -> string 
- contacts -> Array<string>
- address -> string
- zipcode -> int 

*Return*

status -> string 
message -> string  

*Action*
- Register user 

### Login

*Parameters*

- email -> string
- password -> string

*Return*

status -> string
message -> string
token -> string

*Action*
- Login user (return token if ok)

### Forgot

*Parameters*

- email -> string

*Return*

status -> string
message -> string

*Action*
- Send tmp code in email 

### Recovery

*Parameters*

- email -> string
- tmp -> string
- password -> string

*Return*

status -> string
message -> string

*Action*
- Change password if tmp is good