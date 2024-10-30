module API
  module V1
    class BillsController < API::V1::APIController
      before_action :set_bill, only: [:show, :update, :destroy]

      # GET /bills
      def index
        @bills = Bill.all
        render json: @bills
      end

      # GET /bills/:id
      def show
        render json: @bill
      end

      # POST /bills
      def create
        @bill = Bill.new(bill_params)

        if @bill.save
          associate_users_with_amounts(@bill)
          render json: @bill, status: :created
        else
          render json: { errors: @bill.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /bills/:id
      def update
        if @bill.update(bill_params)
          render json: @bill
        else
          render json: @bill.errors, status: :unprocessable_entity
        end
      end

      # DELETE /bills/:id
      def destroy
        @bill.destroy
        head :no_content
      end

      private

      def set_bill
        @bill = Bill.find(params[:id])
      end

      def bill_params
        params.require(:bill).permit(:user_id, :name, :amount, :due_date)
      end

      def associate_users_with_amounts(bill)
        user_amounts = params[:bill][:user_amounts]

        puts user_amounts

        user_amounts.each do |user_amount|
          user = User.find(user_amount[:user_id])
          amount = user_amount[:amount]

          UserDebt.create!(user: user, bill: bill, amount_owed: amount, settled: false)
        end
      end
    end
  end
end

