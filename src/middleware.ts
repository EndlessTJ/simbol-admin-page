import { NextRequest, NextResponse } from 'next/server'
// import { redirect } from 'next/navigation';
 
export default async function middleware(request: NextRequest) {
  // 将路径设置在请求头中，以便在layout中获取去
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-url', request.url);

  const token = request.cookies.get('accessToken');
  const response = NextResponse.next({
    headers: requestHeaders
  });
  // 白名单路径（如登录页、公开 API）
    const publicPaths = ["/login", "/api/public"];
  // if (token) {
  //   // 转换cookie
  //   response.headers.set('Authorization', `Bearer ${token.value}`);
  // } 

  if(!token && !publicPaths.includes(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl, {
      headers: requestHeaders
    });

  }
 
  return response
}
 
// Routes Middleware should not run on
export const config = {
  matcher: [   {
    // 核心匹配逻辑：排除 _next/static、_next/image 和 .png 文件
    source: "/((?!_next/static|_next/image|.*\\.(?:png|jpg|ico)$).*)",
    // 可选的其他配置（如忽略预渲染路径）
    missing: [{ type: 'header', key: 'next-router-prefetch' }]
  }],
}