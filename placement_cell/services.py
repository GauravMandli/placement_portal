def get_company_data(company):
    return {
        "id": company.id,
        "company_name": company.company_name,
        "industry": company.industry,
        "company_email": company.company_email,
        "phone": company.phone,
        "website": company.website,
        "description": company.description,
        "address": company.address,
        "company_size": company.company_size,
        "gst_number": company.gst_number,

        "contact_person_name": company.cp_name,
        "contact_email": company.cp_email,
        "contact_phone": company.cp_phone,
        "designation": company.designation,

        "status": company.get_status_display(),
        "certificate_url": company.reg_certificate.url if company.reg_certificate else "",
        "created_at": company.created_at.strftime("%d %b %Y"),
    }