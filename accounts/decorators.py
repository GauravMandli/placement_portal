from functools import wraps
from django.shortcuts import render, redirect

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