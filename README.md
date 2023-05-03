- Clone the repository

- Using npm version 8.19.2 run "npm install" to install neccessary node packages

- Create a mysql database instance -> https://dev.mysql.com/doc/mysql-getting-started/en/

- Create a .env file in the root directory with the following contents

#mysql database connection
#port should be 3306 for mysql
DATABASE_URL =  mysql://username:password@host:port/database 

#sportsdata.io api key
#using 2 keys for when requests limit is reached
#API_KEY=fbe269d8e236420cbe406d50bfee3ea3
#API_KEY=eb42be4f18d14053b6eeb2be151ebdcf
#API_KEY=92b33b3c766b4421923b11b00b62adc5
API_KEY = 10cc693545fa4ca78fe5d7df99cfdc0d

#firebase service account configs
FIREBASE_SERVICE_ACCOUNT = {"type": "service_account","project_id": "test-fanhuddle","private_key_id": "122bf1a05f3f6a07ff397bc27003094406272cb0","private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDpgj8p74MaOxnc\nCqRiT9KUQ7z+Q+UPEFEYXBs4r/4YcjO8vAUP7ZsisGgkmL90CwSAfQxbxfy2/o16\nxPs1gOlSvOk1J9rbwinJp1lijbsSoaEfMnCzEQVjGfSRFVAcxZNqo82dQuQlwIUt\nY0qn+LgzCbG/UJSUCGLjb2+QhAcBc/yMXx31TGgXGnPqBVZYBvNPybT4+UPFAqcm\nLjDDrL9ThaPfpFlWbsFVZl9qkWaot6OHV/Ok4+ecPSmj9O3+Y/oa222Sxx3L1/2C\n6qvorhlVmKLxJVyR/iEWys6m+dAVdpdBc4bfNqSngliHLxT8BdI7/y4m4BMGo2+r\nE4/Z0InfAgMBAAECggEAVqAnf46nk70WIE/gYMpdA/zHKYqVeMukUgWlYZfEi1we\nfmc/94M9mJZZ5C24ZLvLnUEGqysdT+PKJ5/Y06XxqOyFFV+mLP1wVCtdmRacLlLA\nu5qSPZPUbEnONV5zPGE9iYOf/TW5/plXrplVsk+uQdzYUHF71RjxWo9WE4YvNSWV\nOGfonTGiAjXn78tSIpHSWg3k4w8GxWirkJ3JVDDMbZ1qfcTCrZIqWd5L18YZYZl8\ncFctidsrFbhizJefCR8NksnKSDvkOKGLEnqzTtz/dU9gT9oIYY0OV8c7CUtTqkJ9\n2Fn5zc/d9dhTOwgjov/HYIJmzZ7ldwlvUjzimoyG0QKBgQD6MKZLelzYLTf+5pdk\ndJ56LEtC22zGJiCg2I/6PbHoy1puq4lswLVVkAotBwcdFCwxRuzirO1snEdv8Jzb\ndWMv9tsY8VuRGf68p91V4cU/DqW7W5rPA8SO83p+BhGLlOXOLzwEDZGda5a0MSP2\nPO+LshDHbQf2Ina1N7zrUIXsjwKBgQDu7m3TPhaOZ34ejDtrZTY0tVS/0vgD340D\ntGNbywFKmE08/lP6qic+wbciF/Wn3tJXaIjdwKC2aKfWh95JP957dHLWvn2Lip+M\nmDZ7iFn+o0Nlhp4A/YMzLyCLVfr5SeOgK7SdyuoZbUpkM7lESxwrCwap0fG6+kRM\n3L9rNsvVsQKBgQCC9e5GOhHZcqoJ+qgqhETkTMVEhNlGS3Tu3Q1Yfuzen3uBzLbN\nv33sAM7izPfzR7juPmMHMF/DZ3aZaMiis6qs07nSL5yvsny+QdxA9UIrhL5J+WRq\nkl1UOqzWxNRwTQuRxvXSZUvgrA2h2sspPLJjXF0eFruBIn8i0r9IKclAjwKBgFgw\nzXzRSAYcESM5Y51KaG2gGL4NItpbI3Ogm6QAFGPyP2AqB9lYANBbNDtzWIsz5bO5\ns/sV5LwvePPohpXG61nqK5E0Eqb07ds5O7LxKzagEHpi6+M1r72uwXZssAxfx5MR\nTsOHaE0mV/UQWmvoxWbl1PnNsknvolI0kLsEKMyhAoGBAIbwENks/Vvne8xqWYeO\nyvxqG5DzeB/gZ5hXTlnjsXco5o69RBzbMPStrnvpNUlxsGUEPew7sLng7JU2E/XJ\n3HLYzpmdfb9lSipUjLRann/2o40tZ6srAXdVAk4OAAp9RUDCsByeJSduLMz3v7Qe\nUUT2HCgy/nSnXOQGVEVF/fq0\n-----END PRIVATE KEY-----\n","client_email": "firebase-adminsdk-am6jm@test-fanhuddle.iam.gserviceaccount.com","client_id": "109671901946640524331","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-am6jm%40test-fanhuddle.iam.gserviceaccount.com"}

- Create a .env.development.local file with the following contents
# PORT
PORT = 8000

# TOKEN
SECRET_KEY = secretKey

# LOG
LOG_FORMAT = dev
LOG_DIR = ../logs

# CORS
ORIGIN = http://localhost:3000
CREDENTIALS = true

- Run "npx prisma migrate dev" to add migrations to database and generate prisma ORM client

- Run "npm run initAndSeed" to seed database

- Run "npm run dev" to start the REST API service

- Run "npm run taskManager" to start the TaskManager service

- Run "npm run dataSink" to start the DataSink service
