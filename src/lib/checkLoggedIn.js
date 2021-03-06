const checkLoggedIn = (ctx, next) => {
    console.log('checkLoggedIn 호출됨');
    if(!ctx.state.user){
        ctx.status = 401;
        ctx.body = {
            code : 'NOT_LOGGED_IN',
            message : '로그인이 필요합니다.'
        };
        return;
    }
    return next();
}

export default checkLoggedIn;

/*
    checkeLoggedIn 이라는 미들웨어를 만들어서 로그인해야만 글쓰기, 수정, 삭제를 할 수 있도록 구현
    lib 디렉터리에 checkedLoggedIn.js 파일을 생서하고 다음 미들웨어를 작성하세요
    이 미들웨어를 lib 디렉터리에 저장하는 이유는 다른 라우트에서도 사용될 가능성이 있기 때문입니다.
    물론 이 프로젝트에서 auth를 제외한 라우트는 posts가 유일하기 때문에 auth.ctrl.js에서 
    구현해도 상관없지만, 로그인 상태 확인 작업은 자주 사용하는 기능이므로 더 쉽게 재사용 할 수 있도록
    lib 디렉터리에 작성하는 것입니다. 

    이 미들웨어는 로그인 상태가 아니라면 401 HTTP Status를 반환하고, 
    그렇지 않다면 그 다음 미들웨어들을 실행합니다.

    이 미들웨어를   posts라우터에서 사용해 보겠습니다.
    ../api/posts/index.js
*/