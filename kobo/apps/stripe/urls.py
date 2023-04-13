from django.urls import include, re_path
from rest_framework.routers import SimpleRouter


from kobo.apps.stripe.views import (
    SubscriptionViewSet,
    CheckoutLinkView,
    CustomerPortalView,
    OneTimeAddOnViewSet,
    ProductViewSet,
)

router = SimpleRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'products', ProductViewSet)
router.register(r'addons', OneTimeAddOnViewSet, basename='addons')


urlpatterns = [
    re_path(r'^', include(router.urls)),
    re_path(
        r'^checkout-link', CheckoutLinkView.as_view(), name='checkoutlinks'
    ),
    re_path(
        r'^customer-portal', CustomerPortalView.as_view(), name='portallinks'
    ),
]
