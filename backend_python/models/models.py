from tortoise import fields, models

class Lead(models.Model):
    id = fields.UUIDField(pk=True)
    notion_id = fields.CharField(max_length=255, unique=True)
    name = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, null=True)
    phone = fields.CharField(max_length=255, null=True)
    status = fields.CharField(max_length=50, default="New")
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "leads"

class HistoryItem(models.Model):
    id = fields.IntField(pk=True)
    lead = fields.ForeignKeyField("models.Lead", related_name="history")
    title = fields.CharField(max_length=255)
    description = fields.TextField()
    timestamp = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "history_items"
