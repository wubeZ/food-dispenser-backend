import './common/env.js'
import express from 'express'
import routes from './common/router.js'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import './services/db.js';
import logger from './common/logger.js'

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(
    express.urlencoded({extended : true,
        limit: process.env.REQUEST_LIMIT || '100kb'}));

app.use(express.json());

app.get('/', (request, response)=>{
    response.status(200).json('health check: OK')
});

const port = process.env.PORT;
app.listen(port, () => {    
    logger.info(`Server is running on port ${port}`)

})


app.use('/v1/', routes);

export default app;



