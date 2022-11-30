import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { getAnalytics } from 'firebase/analytics';

// test Huddle Up Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC3VhVqA-zR0mOA9-sUwTw-0JohqqIxPCY',
  authDomain: 'test-fanhuddle.firebaseapp.com',
  projectId: 'test-fanhuddle',
  storageBucket: 'test-fanhuddle.appspot.com',
  messagingSenderId: '526044775750',
  appId: '1:526044775750:web:d8242c7328c52df3b55147',
  measurementId: 'G-NX81Y3HZPH',
};

// initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth();
// const analytics = getAnalytics(app);
console.log(app); //just to get past linter

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // create user in firebase
      createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
        .then((userCredential) => {
          // user created and signed in
          console.log('User created succesfully.');
          const user = userCredential.user;

          // add user to database
          // const userData: CreateUserDto = req.body;
          // const createUserData: User = await this.userService.createUser(userData);

          res.status(201).json({ data: user, message: 'created' });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('Error creating user. Code: ' + errorCode + ', Message: ' + errorMessage);
        });

    } catch (error) {
      next(error);
    }
  };

  public loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      //authorize with firebase
      signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then(cred => {
      console.log('User logged in succesfully! Creds: ', cred);
      res.status(200).json({ data: cred.user.getIdToken(), message: 'logged in' });
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('Error logging user in. Code: ' + errorCode + ', Message: ' + errorMessage); });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const userData: CreateUserDto = req.body;
      const updateUserData: User[] = await this.userService.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User[] = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
