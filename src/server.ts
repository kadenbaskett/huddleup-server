import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import StatsRoute from '@routes/stats.route';
import validateEnv from '@utils/validateEnv';
import DatabaseRoute from './routes/database.route';

validateEnv();

const routes = [ 
    new IndexRoute(), 
    new StatsRoute(), 
    new DatabaseRoute(),
];

const app = new App(routes);

app.listen();
