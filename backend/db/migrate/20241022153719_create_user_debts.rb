class CreateUserDebts < ActiveRecord::Migration[7.2]
  def change
    create_table :user_debts, id: false do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.belongs_to :bill, null: false, foreign_key: true
      t.decimal :amount_owed, precision: 10, scale: 2
      t.boolean :paid, default: false

      t.timestamps
    end

    add_index :user_debts, [:user_id, :bill_id], unique: true
  end
end
