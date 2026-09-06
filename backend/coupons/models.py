from decimal import Decimal
from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)  # For percentage, it's a percentage (e.g., 10 for 10%); for fixed, it's an amount
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Total number of times the coupon can be used')
    usage_limit_per_user = models.PositiveIntegerField(default=1, help_text='Maximum number of times a user can use this coupon')
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Minimum order amount required to apply the coupon')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.valid_from <= now and self.valid_to >= now

    def discount_amount(self, order_amount):
        """Calculate the discount amount based on the order amount."""
        if not self.is_valid:
            return Decimal('0')
        order_amount = Decimal(str(order_amount))
        if order_amount < self.minimum_order_amount:
            return Decimal('0')
        if self.discount_type == 'percentage':
            return order_amount * (self.discount_value / Decimal('100'))
        else:  # fixed
            return min(self.discount_value, order_amount)