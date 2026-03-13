from functools import wraps
from django.shortcuts import render, redirect
from django.contrib import messages


def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        #  Not logged in → redirect to login
        if not request.user.is_authenticated:
            return redirect("pc_login")

        #  Logged in but not admin → 403 page
        if request.user.role != "placement_cell":
            return render(request, "errors/403.html", status=403)

        #  Proper admin
        return view_func(request, *args, **kwargs)

    return wrapper

def company_required(view_func):
    def wrapper(request, *args, **kwargs):

        if request.user.role != "company":
            messages.error(request, "Access denied.")
            return redirect("company_login")

        return view_func(request, *args, **kwargs)

    return wrapper