from functools import wraps
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponseForbidden

#placement cell
def placement_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        # #  Not logged in → redirect to login
        # if not request.user.is_authenticated:
        #     return redirect("pc_login")

        #  Logged in but not admin → 403 page
        if request.user.role != "placement_cell":
            return render(request, "errors/403.html", status=403)

        #  Proper admin
        return view_func(request, *args, **kwargs)

    return wrapper

#company
def company_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        # if not request.user.is_authenticated:
        #     return redirect("company_login")

        if request.user.role != "company":
            return render(request, "errors/403.html", status=403)

        return view_func(request, *args, **kwargs)

    return wrapper

#student
def student_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        # # Not logged in
        # if not request.user.is_authenticated:
        #     return redirect("student_login")

        # Wrong role
        if request.user.role != "student":
            return render(request, "errors/403.html", status=403)

        return view_func(request, *args, **kwargs)

    return wrapper

#3ey brabar 1 che a role requrd use karu jo karvu hoy to 
# #role chcke
# def role_required(role):
#     def decorator(view_func):
#         @wraps(view_func)
#         def wrapper(request, *args, **kwargs):

#             if request.user.role != role:
#                 return HttpResponseForbidden("Unauthorized")

#             return view_func(request, *args, **kwargs)

#         return wrapper
#     return decorator