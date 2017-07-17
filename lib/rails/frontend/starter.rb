require "rails"

module Frontend
  class BaseGenerator < ::Rails::Generators::Base
    def base
      p 'base'
      end
  end

  class ReactGenerator < ::Rails::Generators::Base
    def react
      p 'react'
    end
  end
end
