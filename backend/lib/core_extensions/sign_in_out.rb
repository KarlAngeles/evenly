module CoreExtensions
  module SignInOut
    # This is the same as the one implemented in devise except it skips the session store
    def bypass_sign_in(resource, scope: nil)
      scope ||= Devise::Mapping.find_scope!(resource)
      expire_data_after_sign_in!
      warden.set_user(resource, {store: false}.merge!(scope: scope))
    end
  end
end
