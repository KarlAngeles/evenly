module API
  module V1
    class APIController < ActionController::API
      include DeviseTokenAuth::Concerns::SetUserByToken

      # before_action :authenticate_user!

      rescue_from ActiveRecord::RecordNotFound,        with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid,         with: :render_record_invalid
      rescue_from ActionController::ParameterMissing,  with: :render_parameter_missing

      private

      def render_not_found(exception)
        render_error(exception, { message: I18n.t('api.errors.not_found') }, :not_found)
      end

      def render_record_invalid(exception)
        render_error(exception, exception.record.errors.as_json, :bad_request)
      end

      def render_parameter_missing(exception)
        render_error(exception, { message: I18n.t('api.errors.missing_param') }, :unprocessable_entity)
      end

      def render_error(exception, errors, status)
        logger.info { exception }
        render json: { errors: Array.wrap(errors) }, status: status
      end
    end
  end
end


