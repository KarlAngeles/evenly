class CreateBills < ActiveRecord::Migration[7.2]
  def change
    create_table :bills do |t|
      t.string :description
      t.decimal :amount, precision: 10, scale: 2
      t.date :due_date
      t.boolean :paid, default: false
      t.belongs_to :user, null: false, foreign_key: true  # Owner of the bill

      t.timestamps
    end
  end
end
