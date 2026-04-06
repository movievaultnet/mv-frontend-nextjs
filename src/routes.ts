import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  index("app/pages/Landing.tsx"),
  route("login", "app/pages/Login.tsx"),
  route("register", "app/pages/Register.tsx"),
  route("reset-password", "app/pages/ResetPassword.tsx"),
  
  layout("app/components/ProtectedRouteLayout.tsx", [
    route("home", "app/pages/Home.tsx"),
    route("catalog", "app/pages/Catalog.tsx"),
    route("catalog/releases/new", "app/pages/AddRelease.tsx"),
    route("releases/:slug", "app/pages/ReleaseDetail.tsx"),
    route("movie/:id", "app/pages/MovieDetail.tsx"),
    route("collection", "app/pages/Collection.tsx"),
    route("ranking", "app/pages/Ranking.tsx"),
    route("settings", "app/pages/Settings.tsx"),
  ]),

  route("ai-content", "app/pages/AIContent.tsx"),
  route("ai-content/:slug", "app/pages/AIArticleDetail.tsx"),

  route("*", "app/pages/NotFound.tsx"),
] satisfies RouteConfig;
