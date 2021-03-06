'use strict';
var app = angular.module('exemplo-public');
/**
 * Factory para utilitários
 */
app.factory('Utils', 
	['$rootScope', '$log', '$mdDialog', '$mdToast', '$mdMedia', '$location',
    function($rootScope, $log, $mdDialog, $mdToast, $mdMedia, $location){
		var self = this;
		
		/**
		 * Mostra ou esconde a janela modal de aguardando
		 */
		self.waitIsVisible = false;
		self.waitDialog = null;
		self.waitController = ['$scope', '$mdDialog', function ($scope, $mdDialog) {
			
		}];
		self.wait = function(visible){
			if(visible && !self.waitIsVisible){
				self.waitIsVisible = true;
				self.waitDialog = $mdDialog.show({
					  controller: self.waitController,
					  templateUrl: 'views/dialogs/wait.html',
				      parent: angular.element(document.body),
				      clickOutsideToClose: false
				});	
			}else if(!visible && self.waitIsVisible){
				$mdDialog.hide().then(function(){
					self.waitIsVisible = false;	
				});
			}
		};
		/**
		 * Mostra o toast de successo
		 */
		self.success = function(message){
			$mdToast.show({
		          hideDelay   : 0,
		          position    : 'top right',
		          controller  : ['$scope', '$mdToast',function($scope, $mdToast){
		      						$scope.message = message;
		      						$scope.mdMedia = $mdMedia;
		      						$scope.closeToast = function() {
		      							$mdToast.hide();
		      						}
		          				}],
		          templateUrl : 'views/dialogs/success_toast.html'
		    });
		}
		/**
		 * Mostra o toast de erro
		 */
		self.error = function(message){
			self.wait(false);
			$mdToast.show({
		          hideDelay   : 5000,
		          position    : 'top right',
		          controller  : ['$scope', '$mdToast', function($scope, $mdToast){
		      						$scope.message = message;
		      						$scope.mdMedia = $mdMedia;
		      						$scope.closeToast = function() {
		      							$mdToast.hide();
		      						}
		          				}],
		          templateUrl : 'views/dialogs/error_toast.html'
		    });
		}
		self.exception = function(data){
			$log.debug(JSON.stringify(data));
			var exception = null;
			//para serviços fora do ar 
			if(data.status == -1){
				self.error('Sistema indisponível no momento.');
			}
			//para exceções não capturadas 
			if(data.data.exception != null){
				exception = data.data.exception;
				if(exception == 'java.net.ConnectException'){
					self.error('Servidor indisponível no momento.');
				}else if(exception == 'org.springframework.mail.MailSendException'){
					self.error('Falha no servidor de e-mail.');
				}else{
					self.error('Falha interna do sistema.');
				}			
				return;
			}
			//exceção de acesso negado
			if(data.status == 403){
				self.error('Acesso negado.');
				return;
			}		
			if(data.status == 422){
				self.error('Os dados enviados estão incorretos.')
			}
			//para exceções tratadas pelo advice
			if(data.data.code != null){
				exception = data.data.message;
				self.error(exception);
				return;
			}		
			//para algum erro desconhecido
			self.error('Não foi possível completar a operação.')
		}
		
		return self;
}]);
