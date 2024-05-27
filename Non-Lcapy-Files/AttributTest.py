class Test:
    def __init__(self):
        self._attributes = {}

    def __getitem__(self, key):
        return self._attributes[key]

    def __setitem__(self, key, value):
        self._attributes[key] = value

    def __getattr__(self, key):
        return self._attributes[key]

    def __setattr__(self, key, value):
        if key.startswith('_'):
            super().__setattr__(key, value)
        else:
            self.__setitem__(key, value)


a = Test()
a["Step1"] = "This is step 1"
setattr(a, "Step2", "This is step 2")

print(a.Step1)
print(a["Step1"])

print(a.Step2)
print(a["Step2"])
