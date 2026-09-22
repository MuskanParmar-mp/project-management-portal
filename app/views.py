from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Project, Task, Comment, Activity

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    ActivitySerializer
)


# =========================
# REGISTER
# =========================

class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {"message": "Registration successful"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================
# LOGIN
# =========================

class LoginView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is not None:

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id,
                "username": user.username
            })

        return Response(
            {"message": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )


# =========================
# USERS
# =========================

class UserListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        users = User.objects.exclude(
            id=request.user.id
        )

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(serializer.data)


# =========================
# PROJECTS
# =========================

class ProjectViewSet(ModelViewSet):

    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Project.objects.filter(
                members=self.request.user
            )
            |
            Project.objects.filter(
                owner=self.request.user
            )
        ).distinct()

    # =========================
    # CREATE PROJECT
    # =========================

    def perform_create(self, serializer):

        project = serializer.save(
            owner=self.request.user
        )

        project.members.add(
            self.request.user
        )

        Activity.objects.create(
            project=project,
            user=self.request.user,
            message=(
                f'{self.request.user.username} created '
                f'project "{project.name}"'
            )
        )

    # =========================
    # ADD PROJECT MEMBER
    # =========================

    @action(
        detail=True,
        methods=["post"],
        url_path="add-member"
    )
    def add_member(self, request, pk=None):

        project = self.get_object()

        user_id = request.data.get("user_id")

        if not user_id:

            return Response(
                {"message": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already member

        if project.members.filter(
            id=user.id
        ).exists():

            return Response(
                {"message": "User is already a member"},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.members.add(user)

        Activity.objects.create(
            project=project,
            user=request.user,
            message=(
                f'{request.user.username} added '
                f'{user.username} to "{project.name}"'
            )
        )

        return Response(
            {
                "message": "Member added successfully",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )


# =========================
# TASKS
# =========================

class TaskViewSet(ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Task.objects.filter(
            project__members=self.request.user
        )

    # =========================
    # CREATE TASK
    # =========================

    def perform_create(self, serializer):

        project = serializer.validated_data.get(
            "project"
        )

        if not project.members.filter(
            id=self.request.user.id
        ).exists():

            raise PermissionDenied(
                "You are not a member of this project."
            )

        task = serializer.save()

        Activity.objects.create(
            project=project,
            user=self.request.user,
            message=(
                f'{self.request.user.username} created '
                f'task "{task.title}"'
            )
        )

    # =========================
    # UPDATE TASK
    # =========================

    def perform_update(self, serializer):

        old_task = self.get_object()

        old_status = old_task.status

        task = serializer.save()

        # Status changed

        if old_status != task.status:

            status_name = task.get_status_display()

            Activity.objects.create(
                project=task.project,
                user=self.request.user,
                message=(
                    f'{self.request.user.username} moved '
                    f'"{task.title}" to {status_name}'
                )
            )

        else:

            Activity.objects.create(
                project=task.project,
                user=self.request.user,
                message=(
                    f'{self.request.user.username} updated '
                    f'task "{task.title}"'
                )
            )

    # =========================
    # DELETE TASK
    # =========================

    def perform_destroy(self, instance):

        project = instance.project
        task_title = instance.title

        Activity.objects.create(
            project=project,
            user=self.request.user,
            message=(
                f'{self.request.user.username} deleted '
                f'task "{task_title}"'
            )
        )

        instance.delete()


# =========================
# COMMENTS
# =========================

class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Comment.objects.filter(
            task__project__members=self.request.user
        )

    def perform_create(self, serializer):

        comment = serializer.save(
            user=self.request.user
        )

        Activity.objects.create(
            project=comment.task.project,
            user=self.request.user,
            message=(
                f'{self.request.user.username} commented '
                f'on "{comment.task.title}"'
            )
        )


# =========================
# ACTIVITIES
# =========================

class ActivityViewSet(ModelViewSet):

    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Activity.objects.filter(
            project__members=self.request.user
        ).order_by("-created_at")

    # Activity ko manually create/edit/delete nahi karne denge

    def create(self, request, *args, **kwargs):

        return Response(
            {
                "message":
                "Activities are created automatically."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):

        return Response(
            {
                "message":
                "Activities cannot be edited."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):

        return Response(
            {
                "message":
                "Activities cannot be deleted."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )