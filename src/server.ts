import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import StatsRoute from '@routes/stats.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const routes = [ 
    new IndexRoute(), 
    new UsersRoute(), 
    new AuthRoute(), 
    new StatsRoute(), 
];

const app = new App(routes);

app.listen();
