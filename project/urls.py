from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import TokenRefreshView

from app.views import (
    RegisterView,
    LoginView,
    UserListView,
    ProjectViewSet,
    TaskViewSet,
    CommentViewSet,
    ActivityViewSet,
)


router = DefaultRouter()

router.register(
    "projects",
    ProjectViewSet,
    basename="projects"
)

router.register(
    "tasks",
    TaskViewSet,
    basename="tasks"
)

router.register(
    "comments",
    CommentViewSet,
    basename="comments"
)

router.register(
    "activities",
    ActivityViewSet,
    basename="activities"
)


urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "register/",
        RegisterView.as_view()
    ),

    path(
        "login/",
        LoginView.as_view()
    ),

    path(
        "users/",
        UserListView.as_view()
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view()
    ),

    path(
        "",
        include(router.urls)
    ),
]