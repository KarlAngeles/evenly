module API
  module V1
    class UserDebtsController < API::V1::APIController
      before_action :set_user_debt, only: [:show, :update, :destroy]

      # GET /user_debts
      def index
        @user_debts = UserDebt.all
        render json: @user_debts
      end

      # GET /user_debts/:id
      def show
        render json: @user_debt
      end

      # POST /user_debts
      def create
        @user_debt = UserDebt.new(user_debt_params)

        if @user_debt.save
          render json: @user_debt, status: :created
        else
          render json: @user_debt.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /user_debts/:id
      def update
        if @user_debt.update(user_debt_params)
          render json: @user_debt
        else
          render json: @user_debt.errors, status: :unprocessable_entity
        end
      end

      # DELETE /user_debts/:id
      def destroy
        @user_debt.destroy
        head :no_content
      end

      def settle
        user_debt = UserDebt.find_by!(user_id: params[:user_id], bill_id: params[:bill_id])

        if user_debt.update!(settled: true)
          render json: { message: 'Debt paid successfully', user_debt: user_debt }, status: :ok
        else
          render json: { error: 'Unable to pay the debt' }, status: :unprocessable_entity
        end
      end

      private

      def set_user_debt
        @user_debt = UserDebt.find(params[:id])
      end

      def user_debt_params
        params.require(:user_debt).permit(:user_id, :bill_id, :amount_owed, :settled)
      end
    end
  end
end
