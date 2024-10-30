# Credit: https://binarysolo.blog/applying-monkey-patches-in-rails/
# Require all Ruby files in the core_extensions directory
Dir[Rails.root.join('lib', 'core_extensions', '*.rb')].each { |f| require f }

# Apply the monkey patches
Devise::Controllers::SignInOut.prepend CoreExtensions::SignInOut
