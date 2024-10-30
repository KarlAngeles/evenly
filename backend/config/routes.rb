Rails.application.routes.draw do
  root to: proc { [404, {}, ["Not found."]] }

  scope format: :json do
    mount_devise_token_auth_for 'User', at: '/api/v1/auth'
  end

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      resources :users do
        member do
          get :bills
          get :debts
          get :amount_owed
          get :amount_receivable
        end
      end
      resources :bills
      resources :user_debts do
        collection do
          post :settle
        end
      end
    end
  end
end
