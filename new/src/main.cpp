#include "stdio.h"

#include "application/application.h"

int main(int argc, char* argv[])
{
	Vast::Application::Application application(argc, argv);
	application.init();
	
	return application.run();
}