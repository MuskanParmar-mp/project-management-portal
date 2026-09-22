from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Project,
    Task,
    Comment,
    Activity
)


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email"
        ]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password"
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user


class ProjectSerializer(serializers.ModelSerializer):

    owner = UserSerializer(
        read_only=True
    )

    members = UserSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "members",
            "created_at"
        ]


class TaskSerializer(serializers.ModelSerializer):

    assigned_to = UserSerializer(
        read_only=True
    )

    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source="assigned_to",
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "assigned_to",
            "assigned_to_id",
            "status",
            "priority",
            "due_date",
            "created_at"
        ]

    def validate(self, attrs):

        project = attrs.get(
            "project",
            getattr(
                self.instance,
                "project",
                None
            )
        )

        assigned_user = attrs.get(
            "assigned_to",
            getattr(
                self.instance,
                "assigned_to",
                None
            )
        )

        if assigned_user and project:

            if not project.members.filter(
                id=assigned_user.id
            ).exists():

                raise serializers.ValidationError(
                    {
                        "assigned_to_id":
                        "This user is not a member of this project."
                    }
                )

        return attrs


class CommentSerializer(serializers.ModelSerializer):

    user = UserSerializer(
        read_only=True
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "user",
            "text",
            "created_at"
        ]


class ActivitySerializer(serializers.ModelSerializer):

    user = UserSerializer(
        read_only=True
    )

    class Meta:
        model = Activity
        fields = [
            "id",
            "project",
            "user",
            "message",
            "created_at"
        ]