import Router from 'koa-router';
import * as postCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts = new Router();

posts.get('/', postCtrl.list);
posts.post('/',checkLoggedIn, postCtrl.write);

const post = new Router(); // /api/posts/:id

// posts.get('/:id', postCtrl.getPostById, postCtrl.read);
// posts.delete('/:id', checkLoggedIn,postCtrl.checkOwnPost,  postCtrl.remove);
// posts.patch('/:id', checkLoggedIn, postCtrl.checkOwnPost, postCtrl.update);

// posts.use('/:id', postCtrl.getPostById, post.routes());

post.get('/', postCtrl.read); //  /api/posts/:id
post.delete('/', checkLoggedIn, postCtrl.checkOwnPost, postCtrl.remove);
post.patch('/', checkLoggedIn, postCtrl.checkOwnPost,  postCtrl.update);

posts.use('/:id',postCtrl.getPostById, post.routes());


export default posts;