module API
  module V1
    class UsersController < APIController
      include Pagy::Backend

      before_action :set_user, except: [:index, :create]

      # GET /users
      def index
        @users = User.all
        render json: @users
      end

      # GET /users/:id
      def show
        render json: @user
      end

      # POST /users
      def create
        @user = User.new(user_params)
        if @user.save
          render json: @user, status: :created
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /users/:id
      def update
        if @user.update(user_params)
          render json: @user
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      # DELETE /users/:id
      def destroy
        @user.destroy
        head :no_content
      end

      def bills
        bills_created = @user.owned_bills
        @pagy, @records = pagy(bills_created)

        render json: { data: @records.as_json(include: :debtors), pagination: pagy_metadata(@pagy)}
      end

      def debts
        bills_involved = @user.user_debts.order(:settled)
        @pagy, @records = pagy(bills_involved)

        render json: { data: @records.as_json(include: :bill), pagination: pagy_metadata(@pagy)}
      end

      def amount_owed
        total_owed = @user.user_debts.unsettled.sum(:amount_owed)

        render json: { amount_owed: total_owed }
      end

      def amount_receivable
        amount_receivable = @user.owned_bills.unsettled.sum(:amount)

        render json: { amount_receivable: amount_receivable }
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation)
      end
    end
  end
end
