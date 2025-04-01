from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Item
from .serializers import ItemSerializer
from rest_framework.response import Response
from django.db.models import Count

class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']

    def get(self, request, *args, **kwargs):
        # Check for grouping parameter
        group_by = request.query_params.get('group_by', None)
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # If grouping requested
        if group_by == 'category':
            # Get distinct categories with item counts
            categories = Item.objects.values('category').annotate(
                item_count=Count('id'))
            
            # Get items grouped by category
            grouped_data = {}
            for category in categories:
                grouped_data[category['category']] = {
                    'count': category['item_count'],
                    'items': ItemSerializer(
                        queryset.filter(category=category['category']), 
                        many=True
                    ).data
                }
            
            return Response({
                'grouped_by': 'category',
                'data': grouped_data
            })
        
        # If grouping requested
        if group_by == 'name':
            # Get distinct names with item counts
            names = Item.objects.values('name').annotate(
                item_count=Count('id'))
            
            # Get items grouped by category
            grouped_data = {}
            for name in names:
                grouped_data[name['name']] = {
                    'count': name['item_count'],
                    'items': ItemSerializer(
                        queryset.filter(name=name['name']), 
                        many=True
                    ).data
                }
            
            return Response({
                'grouped_by': 'name',
                'data': grouped_data
            })
        
        # Regular filtered response
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'grouped_by': None,
            'data': serializer.data
        })

class ItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all().order_by('-created_at')  # Default sorting by latest
    serializer_class = ItemSerializer