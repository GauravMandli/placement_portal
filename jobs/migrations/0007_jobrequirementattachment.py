from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("jobs", "0006_alter_jobrequirement_status"),
    ]

    operations = [
        migrations.CreateModel(
            name="JobRequirementAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="job_pdfs/")),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("job", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="jobs.jobrequirement")),
            ],
            options={
                "ordering": ["uploaded_at", "id"],
            },
        ),
    ]
