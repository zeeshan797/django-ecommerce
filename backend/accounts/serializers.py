from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'address', 'city', 'state', 'postal_code', 'country', 'date_of_birth', 'profile_picture']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=15, required=False)
    address = serializers.CharField(required=False)
    city = serializers.CharField(max_length=100, required=False)
    state = serializers.CharField(max_length=100, required=False)
    postal_code = serializers.CharField(max_length=20, required=False)
    country = serializers.CharField(max_length=100, required=False)
    date_of_birth = serializers.DateField(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 
                 'phone_number', 'address', 'city', 'state', 'postal_code', 'country', 'date_of_birth']
        extra_kwargs = {'email': {'required': True}}
    
    def validate_password_confirm(self, value):
        if 'password' in self.initial_data and value != self.initial_data['password']:
            raise serializers.ValidationError("Passwords don't match")
        return value
    
    def create(self, validated_data):
        # Extract profile data
        profile_data = {
            'phone_number': validated_data.pop('phone_number', ''),
            'address': validated_data.pop('address', ''),
            'city': validated_data.pop('city', ''),
            'state': validated_data.pop('state', ''),
            'postal_code': validated_data.pop('postal_code', ''),
            'country': validated_data.pop('country', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
        }
        password = validated_data.pop('password')
        password_confirm = validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Update profile with additional data
        # The profile should already exist due to the post_save signal
        if hasattr(user, 'profile'):
            for key, value in profile_data.items():
                setattr(user.profile, key, value)
            user.profile.save()
        else:
            # Fallback: create profile if it doesn't exist (shouldn't happen with signals)
            UserProfile.objects.create(user=user, **profile_data)
        return user