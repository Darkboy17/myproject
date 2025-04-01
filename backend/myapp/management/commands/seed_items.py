from django.core.management.base import BaseCommand
from myapp.models import Item
from faker import Faker
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Seeds the database with 50 mock items'

    def handle(self, *args, **options):
        fake = Faker()
        
        # Categories with some duplicates
        categories = [
            'Electronics', 'Electronics', 'Electronics',
            'Books', 'Books',
            'Clothing', 'Clothing', 'Clothing',
            'Home & Garden',
            'Toys', 'Toys',
            'Sports', 'Sports',
            'Health & Beauty',
            'Office Supplies',
            'Automotive',
            'Groceries'
        ]
        
        # Common product names that will have duplicates
        common_names = [
            'Wireless Earbuds',
            'Smart Watch',
            'T-Shirt',
            'Notebook',
            'Coffee Mug',
            'Bluetooth Speaker',
            'Yoga Mat',
            'Backpack',
            'Desk Lamp',
            'Water Bottle'
        ]
        
        # Create 50 items
        for i in range(50):
            # 30% chance to use a duplicate name
            if random.random() < 0.3 and i > 10:
                name = random.choice(common_names)
            else:
                 name = random.choice(common_names)
                
            Item.objects.create(
                name=name,
                category=random.choice(categories),
                description=fake.paragraph(nb_sentences=3),
                created_at=fake.date_time_between(
                    start_date='-1y', 
                    end_date='now'
                ),
                updated_at=fake.date_time_between(
                    start_date='-1y', 
                    end_date='now'
                )
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully created 50 mock items'))